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

async function loadTopManga(){
    try{
        const response = await fetch('https://api.jikan.moe/v4/top/manga');
        const data = await response.json();
        const topMangaContainer = document.getElementById('top-manga-results');

        if(data.data && Array.isArray(data.data)){
            data.data.slice(0, 20).forEach(manga => {
                const resultCard = document.createElement('div');
                resultCard.className = 'result-card';
                if(manga.title_english){
                    resultCard.innerHTML = `
                        <h3>${manga.title_english}</h3>
                        <img src="${manga.images.jpg.image_url}" alt="${manga.title}" width="180">
                        <p>Voto: ${manga.score}</p>
                        <a href="../manga/dettagli/details.html?id=${manga.mal_id}" class="btn btn-outline-primary">Dettagli</a>
                    `;
                }
                else{
                    resultCard.innerHTML = `
                        <h3>${manga.title}</h3>
                        <img src="${manga.images.jpg.image_url}" alt="${manga.title}" width="180">
                        <p>Voto: ${manga.score}</p>
                        <a href="../manga/dettagli/details.html?id=${manga.mal_id}" class="btn btn-outline-primary">Dettagli</a>
                    `;
                }
                topMangaContainer.appendChild(resultCard);
            });
        }
        else{
            topMangaContainer.innerHTML = 'Non è stato possibile caricare gli anime.';
        }
    }
    catch(error){
        console.error('Error loading top anime:', error);
    }
}

includeHTML("header", "/homepage/header.html");
includeHTML("footer", "/homepage/footer.html");

loadTopManga();