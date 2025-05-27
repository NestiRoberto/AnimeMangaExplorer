async function includeHTML(id, file){
    const element = document.getElementById(id);
    if(element){
        const response = await fetch(file);
        const text = await response.text();
        element.innerHTML = text;
    }
}

includeHTML("header", "header.html");
includeHTML("footer", "footer.html");