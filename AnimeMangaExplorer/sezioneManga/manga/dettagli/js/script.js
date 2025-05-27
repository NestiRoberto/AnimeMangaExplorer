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
            console.error(`Errore nel caricamento del file ${file}:`, error);
        }
    }
}

async function fetchMangaDetails(id){
    try{
        console.log("Manga ID:", id);
        if(!id){
            document.getElementById('manga-details').innerHTML = '<p>ID manga non valido.</p>';
            return;
        }

        const response = await fetch(`https://api.jikan.moe/v4/manga/${id}`);
        console.log("Response status:", response.status);
        if(!response.ok){
            const errorText = await response.text();
            throw new Error(`Errore nella richiesta API: ${errorText}`);
        }

        const data = await response.json();
        const manga = data.data;

        if(!manga){
            document.getElementById('manga-details').innerHTML = '<p>Manga non trovato.</p>';
            return;
        }

        let mangaDetailsHTML = ` 
            <h2>${manga.title_english || manga.title}</h2>
            <img src="${manga.images?.jpg?.large_image_url || ''}" alt="${manga.title}" width="400">
            <p><strong>Title (Original):</strong> ${manga.title || 'Not Available'}</p>
            <p><strong>Title (Kanji):</strong> ${manga.title_japanese || 'Not Available'}</p>
            <p><strong>Synopsis:</strong> ${manga.synopsis || 'No Synopsis Available'}</p>`;

        const authors = manga.authors?.map(author => `<a href="/sezioneManga/autore/dettagli/details.html?id=${author.mal_id}">${author.name}</a>`) || 'Not Available';
        mangaDetailsHTML += `<p><strong>Author(s):</strong> ${authors}</p>`;

        const genres = manga.genres?.map(genre => genre.name).join(', ') || 'Not Available';
        mangaDetailsHTML += `<p><strong>Genres:</strong> ${genres}</p>`;

        mangaDetailsHTML += `
            <p><strong>Published:</strong> ${manga.published?.string || 'Not Available'}</p>
            <p><strong>Chapters:</strong> ${manga.chapters || 'Not Available'}</p>
            <p><strong>Volumes:</strong> ${manga.volumes || 'Not Available'}</p>
            <p><strong>Status:</strong> ${manga.status || 'Not Available'}</p>
            <p><strong>Score:</strong> ${manga.score || 'Not Available'}</p>
            <p><strong>Popularity:</strong> ${manga.popularity || 'Not Available'}</p>`;

        document.getElementById('manga-details').innerHTML = mangaDetailsHTML;
    }
    catch(error){
        document.getElementById('manga-details').innerHTML = '<p>Errore nel caricamento dei dati. Riprova più tardi.</p>';
        console.error('Errore:', error);
    }
}

includeHTML("header", "/homepage/header.html");
includeHTML("footer", "/homepage/footer.html");

const urlParams = new URLSearchParams(window.location.search);
let mangaId = urlParams.get('id');

mangaId = mangaId ? mangaId.trim().split(' ')[0] : '';

if(mangaId && !isNaN(mangaId)){
    fetchMangaDetails(mangaId);
}
else{
    document.getElementById('manga-details').innerHTML = '<p>ID manga non valido.</p>';
    console.error('ID manga non valido:', mangaId);
}