async function includeHTML(id, file){
    const element = document.getElementById(id);
    if(element){
        const response = await fetch(file);
        const text = await response.text();
        element.innerHTML = text;
    }
}

async function searchMedia(type){
    const query = document.getElementById('search-input').value.trim();
    const resultsContainer = document.getElementById('results');
    const mainContent = document.querySelector('main');

    if(!query){
        alert('Inserisci un titolo per la ricerca.');
        return;
    }

    let url = `https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}&sfw`;

    try {
        const response = await fetch(url);
        if(!response.ok){
            throw new Error('Errore nella richiesta API');
        }

        const data = await response.json();
        
        if(!data.data || data.data.length === 0){
            resultsContainer.innerHTML = '<p>Nessun risultato trovato.</p>';
            mainContent.classList.add('no-results');
            return;
        }

        resultsContainer.innerHTML = '';
        mainContent.classList.remove('no-results');

        data.data.forEach(media => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';
            if(media.title_english){
                resultCard.innerHTML = `
                    <h3>${media.title_english}</h3>
                    <img src="${media.images.jpg.image_url}" alt="${media.title}" width="180">
                    <p>${media.synopsis ? media.synopsis.slice(0, 100) + '...' : 'Nessuna descrizione disponibile.'}</p>
                    <a href="../dettagli/details.html?id=${media.mal_id}" target="_blank" class="btn btn-outline-primary">Dettagli</a>
                `;
            }
            else{
                resultCard.innerHTML = `
                    <h3>${media.title}</h3>
                    <img src="${media.images.jpg.image_url}" alt="${media.title}" width="180">
                    <p>${media.synopsis ? media.synopsis.slice(0, 100) + '...' : 'Nessuna descrizione disponibile.'}</p>
                    <a href="../dettagli/details.html?id=${media.mal_id}" target="_blank" class="btn btn-outline-primary">Dettagli</a>
                `;
            }
            resultsContainer.appendChild(resultCard);
        });

    }
    catch(error){
        resultsContainer.innerHTML = '<p>Errore nel caricamento dei dati. Riprova più tardi.</p>';
        console.error(error);
    }
}

includeHTML("header", "/homepage/header.html");
includeHTML("footer", "/homepage/footer.html");

document.getElementById('search-anime-button').addEventListener('click', () => searchMedia('anime'));