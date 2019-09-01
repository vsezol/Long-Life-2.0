// let btn = document.getElementById('load-btn');
let reqType = document.getElementById('exampleFormControlSelect1');

window.localStorage.setItem("isVSNew", "false");
window.localStorage.setItem("isPDNew", "false");

reqType.onchange = () => {
    if (reqType.value == '1') {
        window.localStorage.setItem("isVSNew", "true");
    } else if (reqType.value == '2') {
        window.localStorage.setItem("isPDNew", "true");
    }
}


// btn.addEventListener('click', () => {

// });