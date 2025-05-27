async function includeHTML(id, file){
    const element = document.getElementById(id);
    if(element){
        try{
            const response = await fetch(file);
            if(!response.ok){
                throw new Error(`Errore nel caricamento di ${file}`);
            }
            element.innerHTML = await response.text();
        } 
        catch(error){
            console.error(error);
        }
    }
}
  
async function searchStudio(){
    const query = document.getElementById('search-input').value.trim();
    const resultsContainer = document.getElementById('results');

    if(!query){
        alert('Inserisci il nome di uno studio per la ricerca.');
        return;
    }

    const url = `https://api.jikan.moe/v4/producers?q=${encodeURIComponent(query)}`;

    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error('Errore nella richiesta API');
        } 

        const data = await response.json();
        if(!data.data || data.data.length === 0){
            resultsContainer.innerHTML = '<p class="text-danger text-center">Nessun risultato trovato.</p>';
            return;
        }

        resultsContainer.innerHTML = '';

        data.data.forEach(studio => {
            const studioCard = document.createElement('div');
            studioCard.className = 'result-card';

            const studioImage = studio.images?.jpg?.image_url || 'https://via.placeholder.com/180x100?text=Nessuna+Immagine';

            studioCard.innerHTML = `
              <h3>${studio.titles[0].title}</h3>
              <img src="${studioImage}" alt="${studio.titles[0].title}" width="180">
              <p>${studio.about ? studio.about.slice(0, 100) + '...' : 'Nessuna descrizione disponibile.'}</p>
              <a href="../dettagli/details.html?id=${studio.mal_id}" class="btn btn-outline-primary">Dettagli</a>
            `;

            resultsContainer.appendChild(studioCard);
        });

    }
    catch(error){
        resultsContainer.innerHTML = '<p class="text-danger text-center">Errore nel caricamento dei dati. Riprova più tardi.</p>';
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    includeHTML("header", "/homepage/header.html");
    includeHTML("footer", "/homepage/footer.html");

    document.getElementById('search-studio-button').addEventListener('click', searchStudio);
});