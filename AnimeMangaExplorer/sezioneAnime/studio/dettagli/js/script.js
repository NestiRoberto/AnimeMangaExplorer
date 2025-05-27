async function includeHTML(id, file){
    const element = document.getElementById(id);
    if(!element){
        console.warn(`Elemento con id "${id}" non trovato.`);
        return;
    }
    
    try{
        const response = await fetch(file);
        if(!response.ok){
            throw new Error(`Errore nel caricamento di ${file} (HTTP ${response.status})`);
        } 
        element.innerHTML = await response.text();
    }
    catch(error){
        console.error(`Errore nel caricamento del file ${file}:`, error);
    }
}

async function fetchStudioDetails(id){
    const studioDetailsElement = document.getElementById('studio-details');
    const animeProducedElement = document.querySelector('#anime-produced .results-container');

    if(!studioDetailsElement || !animeProducedElement){
        console.warn("Elemento mancante.");
        return;
    }

    try{
        const response = await fetch(`https://api.jikan.moe/v4/producers/${id}`);
        if(!response.ok){
            throw new Error(`Errore API (HTTP ${response.status})`);
        } 
        const data = await response.json();
        const studio = data.data;

        if(!studio){
            studioDetailsElement.innerHTML = '<p>Studio non trovato.</p>';
            return;
        }

        let html = `
            <h2>${studio.titles?.[0]?.title || "Nome non disponibile"}</h2>
            <img src="${studio.images?.jpg?.image_url || "https://via.placeholder.com/500"}" width="500" height="500" alt="Studio Image">
        `;

        if(studio.titles && studio.titles.length > 1 && studio.titles[1].title){
            html += `<p><strong>Name (Kanji): </strong>${studio.titles[1].title}</p>`;
        }
        if(studio.titles && studio.titles.length > 2 && studio.titles[2].title){
            html += `<p><strong>Synonym: </strong>${studio.titles[2].title}</p>`;
        }

        html += `
            <p><strong>Description: </strong>${studio.about || "Non disponibile"}</p>
            <p><strong>Founding data: </strong>${studio.established ? new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(studio.established)) : "Non disponibile"}</p>
            <p><strong>Anime products: </strong>${studio.count ?? 'Non disponibile'}</p>
        `;

        studioDetailsElement.innerHTML = html;

        const responseAnime = await fetch(`https://api.jikan.moe/v4/anime?producers=${id}`);
        if (!responseAnime.ok) throw new Error(`Errore API (HTTP ${responseAnime.status})`);
        const animeData = await responseAnime.json();
        const animeList = animeData.data;
        
        if(!animeList || animeList.length === 0){
            animeProducedElement.innerHTML = '<p>Nessun anime prodotto trovato.</p>';
            return;
        }

        animeProducedElement.innerHTML = "";
        animeList.forEach(media => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            resultCard.innerHTML = `
                <h3>${media.title_english || media.title || "Titolo non disponibile"}</h3>
                <img src="${media.images?.jpg?.image_url || "https://via.placeholder.com/180"}" alt="${media.title || "Immagine non disponibile"}" width="180">
                <p>${media.synopsis ? media.synopsis.slice(0, 100) + '...' : 'Nessuna descrizione disponibile.'}</p>
                <a href="/sezioneAnime/anime/dettagli/details.html?id=${media.mal_id}" class="btn btn-outline-primary">Dettagli</a>
            `;
            animeProducedElement.appendChild(resultCard);
        });

    }
    catch(error){
        studioDetailsElement.innerHTML = '<p>Errore nel caricamento dei dati. Riprova più tardi.</p>';
        console.error('Errore:', error);
    }
}

includeHTML("header", "/homepage/header.html");
includeHTML("footer", "/homepage/footer.html");

const studioId = new URLSearchParams(window.location.search).get('id');
if(studioId){
    fetchStudioDetails(studioId);
}
else{
    console.warn("Studio ID non specificato nella query string.");
}