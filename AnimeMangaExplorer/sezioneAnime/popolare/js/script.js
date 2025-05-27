async function includeHTML(id, file){
    const element = document.getElementById(id);
    if(element){
        try{
            const response = await fetch(file);
            if(!response.ok){
                throw new Error('Failed to load HTML');
            } 
            const text = await response.text();
            element.innerHTML = text;
        }
        catch(error){
            console.error(`Error including HTML for ${id}:`, error);
        }
    }
}

async function loadTopAnime(){
    try{
        const response = await fetch('https://api.jikan.moe/v4/top/anime');
        const data = await response.json();
        const topAnimeContainer = document.getElementById('top-anime-results');

        if(data.data && Array.isArray(data.data)){
            data.data.slice(0, 20).forEach(anime => {
                const resultCard = document.createElement('div');
                resultCard.className = 'result-card';
                if(anime.title_english){
                    resultCard.innerHTML = `
                        <h3>${anime.title_english}</h3>
                        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" width="180">
                        <p>Voto: ${anime.score}</p>
                        <a href="../anime/dettagli/details.html?id=${anime.mal_id}" class="btn btn-outline-primary">Dettagli</a>
                    `;
                }
                else{
                    resultCard.innerHTML = `
                        <h3>${anime.title}</h3>
                        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" width="180">
                        <p>Voto: ${anime.score}</p>
                        <a href="../anime/dettagli/details.html?id=${anime.mal_id}" class="btn btn-outline-primary">Dettagli</a>
                    `;
                }
                topAnimeContainer.appendChild(resultCard);
            });
        }
        else{
            topAnimeContainer.innerHTML = 'Non è stato possibile caricare gli anime.';
        }
    }
    catch(error){
        console.error('Error loading top anime:', error);
    }
}

includeHTML("header", "/homepage/header.html");
includeHTML("footer", "/homepage/footer.html");

loadTopAnime();