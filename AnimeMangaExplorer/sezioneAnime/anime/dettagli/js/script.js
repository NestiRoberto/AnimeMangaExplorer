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

async function fetchAnimeDetails(id){
    if(!id){
        document.getElementById('anime-details').innerHTML = '<p>ID anime non valido.</p>';
        return;
    }

    try{
        console.log("Anime ID:", id); // Debug ID anime
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        if(!response.ok){
            const errorText = await response.text();
            throw new Error(`Errore nella richiesta API: ${errorText}`);
        }

        const data = await response.json();
        const anime = data.data;

        if(!anime){
            document.getElementById('anime-details').innerHTML = '<p>Anime non trovato.</p>';
            return;
        }

        let animeDetailsHTML = `
            <h2>${anime.title_english || anime.title}</h2>
            <img src="${anime.images?.jpg?.large_image_url || ''}" alt="${anime.title}" width="400">
            <p><strong>Title (Original):</strong> ${anime.title || 'Not Available'}</p>
            <p><strong>Title (Kanji):</strong> ${anime.title_japanese || 'Not Available'}</p>
            <p><strong>Synopsis:</strong> ${anime.synopsis || 'No Synopsis Available'}</p>`;

        // Fetch dello staff per regista e sceneggiatore
        try{
            const staffResponse = await fetch(`https://api.jikan.moe/v4/anime/${anime.mal_id}/staff`);
            if(staffResponse.ok){
                const staffData = await staffResponse.json();
                const staff = staffData.data || [];

                const directors = staff.filter(member => member.positions.includes('Director')).map(member => member.person.name).join(', ') || 'Not Available';
                const writers = staff.filter(member => member.positions.includes('Script') || member.positions.includes('Series Composition')).map(member => member.person.name).join(', ') || 'Not Available';

                animeDetailsHTML += `
                    <p><strong>Director:</strong> ${directors}</p>
                    <p><strong>Writer:</strong> ${writers}</p>`;
            }
        }
        catch(error){
            console.error('Errore nel caricamento dello staff:', error);
        }

        animeDetailsHTML += `
            <p><strong>Genres:</strong> ${anime.genres?.map(genre => genre.name).join(', ') || 'Not Available'}</p>
            <p><strong>Type:</strong> ${anime.type || 'Not Available'}</p>
            <p><strong>Status:</strong> ${anime.status || 'Not Available'}</p>
            <p><strong>Episodes:</strong> ${anime.episodes || 'Not Available'}</p>
            <p><strong>Duration:</strong> ${anime.duration || 'Not Available'}</p>
            <p><strong>Year:</strong> ${anime.year || 'Not Available'}</p>
            <p><strong>Score:</strong> ${anime.score || 'Not Available'}</p>
            <p><strong>Age Rating:</strong> ${anime.rating || 'Not Available'}</p>
            <p><strong>Studio:</strong> <a href="/sezioneAnime/studio/dettagli/details.html?id=${anime.studios[0]?.mal_id}"> ${anime.studios[0]?.name || 'Not Available'}</a> </p>
            <p><strong>Airdate:</strong> ${anime.aired?.string || 'Not Available'}</p>
            <p><strong>Season:</strong> ${anime.season ? anime.season.charAt(0).toUpperCase() + anime.season.slice(1) + ' ' + anime.year : 'Not Available'}</p>`;

        // Aggiunta trailer se disponibile
        if(anime.trailer?.youtube_id){
            animeDetailsHTML += `
                <p><strong>Trailer:</strong></p>
                <iframe width="900" height="630" src="https://www.youtube.com/embed/${anime.trailer.youtube_id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        }

        document.getElementById('anime-details').innerHTML = animeDetailsHTML;
    } 
    catch(error){
        document.getElementById('anime-details').innerHTML = '<p>Errore nel caricamento dei dati. Riprova più tardi.</p>';
        console.error('Errore:', error);
    }
}

includeHTML("header", "/homepage/header.html");
includeHTML("footer", "/homepage/footer.html");

const urlParams = new URLSearchParams(window.location.search);
let animeId = urlParams.get('id');

// Rimuovi eventuali caratteri extra
animeId = animeId ? animeId.split(' ')[0] : '';

if(animeId && !isNaN(animeId)){
    fetchAnimeDetails(animeId);
} 
else{
    document.getElementById('anime-details').innerHTML = '<p>ID anime non valido.</p>';
    console.error('ID anime non valido:', animeId);
}