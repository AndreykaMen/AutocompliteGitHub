const listPrimary = document.querySelector(".input_select");
const input = document.querySelector(".input");
const list = document.querySelector(".main_list");
let arrayStart = [];

const debounce = (fn, ms) => {
    let timeout;
    return function() {
        const fnCall = () => {
            fn.apply(this, arguments);
        };
        clearTimeout(timeout);
        timeout = setTimeout(fnCall, ms);
    };
};

function showList(arr) {
    // Если список открыт , то очищаем предыдущий.
    if (listPrimary.hasChildNodes()) listPrimary.innerHTML = "";
    // Обновляем список
    arr.items.map((key) => {
        listPrimary.innerHTML += `<li id="${key.id}" class="input_select_option">${key.name}</li>`;
    });
    arrayStart = arr.items;
}

function showInputSelect(val) {
    list.innerHTML = "";
    for (key of val) {
        list.insertAdjacentHTML(
            "afterbegin",
            `<div id="${key.id}" class="main_list_item">
    <div class="item_text-wrapper">
    <p class="item_text">Name:${key.name} </p>
    <p class="item_text">Owner:${key.repo} </p>
    <p class="item_text">Stars:${key.stars}</p>
    </div>
    <div class="item_close-wrapper">
    <span class="item_close">X</span>
    </div>
    </div>`
        );
    }
}
// Сохраняю обьект в toLocalStorage
function toLocalStorage(params) {
    for (key of arrayStart) {
        if (key.id == params) {
            const localStorArr = JSON.parse(sessionStorage.getItem("objectShow")) || [];
            // Перебираю массив из toLocalStorage
            const localId = localStorArr.map((el) => el.id);
            // Срвавниваю id входящий евент с имеющимся. Если нет такого , то пушим
            if (!localId.includes(params)) {
                localStorArr.push({
                    id: key.id,
                    repo: key.name,
                    name: key.full_name.split("/")[0],
                    stars: key.watchers_count,
                });
                // Обновляю состояние localStorage
                sessionStorage.setItem("objectShow", JSON.stringify(localStorArr));
                // Рендер нового списка
                showInputSelect(localStorArr);
            } else {
                console.log("Есть в списке...");
            }
        }
    }
}
async function sendAPI(e) {
    const target = e.target.value;
    const regexLang = /[A-Za-z]/;
    if ((e.keyCode < 37 || e.keyCode > 40) && regexLang.test(target)) {
        try {
            const response = await fetch(
                "https://api.github.com/search/repositories?q=" +
                target +
                "&sort=stars&order=desc&per_page=5"
            );
            showList(await response.json());
        } catch (err) {
            console.log("Произошла ошибка связи...", err);
        }
    } else {
        console.log("Используйте латинскую раскладку...");
    }
}
// Удаление
function closeItems(id) {
    const devicesArray = JSON.parse(sessionStorage.getItem("objectShow"));
    devicesArray.splice(devicesArray.map((el) => el.id).indexOf(id), 1);
    sessionStorage.setItem("objectShow", JSON.stringify(devicesArray));
}

// Рендер списка из localStorage.Сохранить состояние
showInputSelect(JSON.parse(sessionStorage.getItem("objectShow")) || []);

sendAPI = debounce(sendAPI, 600);
input.addEventListener("keyup", sendAPI);

document.addEventListener("click", (event) => {
    if (event.target.matches(".item_close")) {
        const idClose = event.target.closest(".main_list_item").id;
        closeItems(+idClose);
        showInputSelect(JSON.parse(sessionStorage.getItem("objectShow")) || []);
    }
    if (event.target.matches(".input_select_option")) {
        listPrimary.innerHTML = "";
        input.value = "";
        toLocalStorage(+event.target.id);
    }
});
localStorage