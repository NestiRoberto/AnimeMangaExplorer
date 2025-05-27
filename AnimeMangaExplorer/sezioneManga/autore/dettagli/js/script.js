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

async function fetchAuthorDetails(id){
    const authorDetailsElement = document.getElementById('author-details');
    const mangaProducedElement = document.querySelector('#manga-realized .results-container');

    if(!authorDetailsElement || !mangaProducedElement){
        console.warn("Elemento mancante.");
        return;
    }

    try{
        const response = await fetch(`https://api.jikan.moe/v4/people/${id}`);
        if(!response.ok){
            throw new Error(`Errore API (HTTP ${response.status})`);
        } 
        const data = await response.json();
        const author = data.data;

        if(!author){
            authorDetailsElement.innerHTML = '<p>Autore non trovato.</p>';
            return;
        }

        let html = `
            <h2>${author.name || "Name not avaible"}</h2>
            <img src="${author.images?.jpg?.image_url || "https://via.placeholder.com/500"}" height="600" width="400" alt="${author.titles?.[0]?.title || "Author Image"}">
            <p><strong>Given Name:</strong> ${author.given_name || "Non disponibile"}</p>
            <p><strong>Family Name:</strong> ${author.family_name || "Non disponibile"}</p>
            <p><strong>Description:</strong> ${author.about || "Non disponibile"}</p>
            <p><strong>Date of birth:</strong> ${author.birthday ? new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(author.birthday)) : "Non disponibile"}</p>
        `;
        authorDetailsElement.innerHTML = html;

        const responseManga = await fetch(`https://api.jikan.moe/v4/people/${id}/manga`);
        if(!responseManga.ok){
            throw new Error(`Errore API (HTTP ${responseManga.status})`);
        } 
        const mangaData = await responseManga.json();
        const mangaList = mangaData.data;

        if(!mangaList || mangaList.length === 0){
            mangaProducedElement.innerHTML = '<p>Nessun manga prodotto trovato.</p>';
            return;
        }

        mangaProducedElement.innerHTML = "";
        for(const item of mangaList.slice(0, 4)){
            const manga = item.manga;
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            resultCard.innerHTML = `
                <h3>${manga.title || "Title not avaible"}</h3>
                <img src="${manga.images?.jpg?.image_url || "https://via.placeholder.com/180"}" alt="${manga.title || "Image not avaible"}" width="180">
            `;
            mangaProducedElement.appendChild(resultCard);

            const mangaDetailsResponse = await fetch(`https://api.jikan.moe/v4/manga/${manga.mal_id}`);
            if(!mangaDetailsResponse.ok){
                throw new Error(`Errore API (HTTP ${mangaDetailsResponse.status})`);
            } 
            const mangaDetailsData = await mangaDetailsResponse.json();
            const mangaDetails = mangaDetailsData.data;

            if(mangaDetails?.synopsis){
                const synopsisElement = document.createElement('p');
                synopsisElement.innerHTML = `${mangaDetails.synopsis.slice(0, 100) + '...' || "Description not avaible"}`;
                resultCard.appendChild(synopsisElement);
            }
            resultCard.innerHTML += `
                <a href="/sezioneManga/manga/dettagli/details.html?id=${manga.mal_id}" class="btn btn-outline-primary">Dettagli</a>
            `;
        }
    }
    catch(error){
        authorDetailsElement.innerHTML = '<p>Errore nel caricamento dei dati. Riprova più tardi.</p>';
        console.error('Errore:', error);
    }
}

// Includi header e footer
includeHTML("header", "/homepage/header.html");
includeHTML("footer", "/homepage/footer.html");

const authorId = new URLSearchParams(window.location.search).get('id');
if(authorId){
    fetchAuthorDetails(authorId);
}
else{
    console.warn("Autore ID non specificato nella query string.");
}