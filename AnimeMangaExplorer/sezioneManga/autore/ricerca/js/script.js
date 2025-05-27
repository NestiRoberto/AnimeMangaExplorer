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

async function hasWrittenManga(personId){
    try{
        const response = await fetch(`https://api.jikan.moe/v4/people/${personId}/manga`);
        if(!response.ok){
            throw new Error('Errore nella richiesta API');
        } 
        const data = await response.json();
        return data.data && data.data.length > 0;
    } 
    catch(error){
        console.error(error);
        return false;
    }
}

async function searchPeople(query){
    const baseUrl = 'https://api.jikan.moe/v4/people';
    const url = query
        ? `${baseUrl}?q=${encodeURIComponent(query)}`
        : `${baseUrl}?page=1`;

    try{
        const response = await fetch(url);
        if(!response.ok){
            throw new Error('Errore nella richiesta API');
        } 
        const data = await response.json();
        
        if(!data.data || data.data.length === 0){
            return [];
        } 

        const filteredPeople = (await Promise.all(
            data.data.map(async (person) => {
                if(await hasWrittenManga(person.mal_id)){
                    return person;
                }
                return null;
            })
        )).filter(person => person !== null);
        
        return filteredPeople;
    } 
    catch(error){
        console.error(error);
        return [];
    }
}

async function displayPeople(){
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p class="text-center">Caricamento in corso...</p>';

    try{
        const searchQuery = document.getElementById('search-input').value.trim();
        const people = await searchPeople(searchQuery);

        if(!people || people.length === 0){
            resultsContainer.innerHTML =
                '<p class="text-danger text-center">Nessuna persona trovata.</p>';
            return;
        }

        resultsContainer.innerHTML = '';

        people.forEach((person) => {
            const personCard = document.createElement('div');
            personCard.className = 'result-card';

            const personName = person.name || 'Nome non disponibile';
            const personImage =
                person.images && person.images.jpg && person.images.jpg.image_url
                    ? person.images.jpg.image_url
                    : 'https://via.placeholder.com/180x100?text=Nessuna+Immagine';
            const personAbout = person.about
                ? person.about.slice(0, 100) + '...'
                : 'Nessuna descrizione disponibile.';

            personCard.innerHTML = `
                <h3>${personName}</h3>
                <img src="${personImage}" alt="${personName}" width="180">
                <p>${personAbout}</p>
                <a href="/sezioneManga/autore/dettagli/details.html?id=${person.mal_id}" class="btn btn-outline-primary">Dettagli</a>
            `;

            resultsContainer.appendChild(personCard);
        });
    } 
    catch(error){
        resultsContainer.innerHTML =
            '<p class="text-danger text-center">Errore nel caricamento dei dati. Riprova più tardi.</p>';
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    includeHTML("header", "/homepage/header.html");
    includeHTML("footer", "/homepage/footer.html");

    document.getElementById('search-author-button').addEventListener('click', displayPeople);
});