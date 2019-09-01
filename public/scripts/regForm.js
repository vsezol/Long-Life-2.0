let companyName = document.getElementById('companyName'),
    userName = document.getElementById('userName'),
    email = document.getElementById('userEmail'),
    pass1 = document.getElementById('password'),
    pass2 = document.getElementById('passwordRepeat'),
    inputError = document.getElementById('inputError'),
    submitBtn = document.getElementById('submit-div'),
    isOriginalEmail = false;
    confirmedPass = false;

function confEmail() {

    let confirmEmail = {
        userEmail: email.value
    };

    console.log(JSON.stringify(confirmEmail));

    //операция запроса и получение данных от сервера
    let request = new XMLHttpRequest();
    // посылаем запрос на адрес "/email-confirm"
    request.open("POST", "/email-confirm", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function () {
        // получаем и парсим ответ сервера
        let answer = JSON.parse(request.response);
        //console.log(answer.isOriginal); // смотрим ответ сервера
        isOriginalEmail = answer.isOriginal;
        if (!isOriginalEmail) {
            inputError.style.display = 'block';
            inputError.innerHTML = '<p style="color: red"; >Такой e-mail уже зарегистрирован</p>';
        } else {
            inputError.style.display = 'none';
        }
    });
    request.send(JSON.stringify(confirmEmail));
}

email.onchange = () => {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(email.value) == false && email.value) {
        inputError.style.display = 'block';
        inputError.innerHTML = '<p style="color: red"; >Введите корректный e-mail</p>';
        return false;
    } else {
        inputError.style.display = 'none';
    }
    confEmail();
}

pass1.onchange = () => {
    if (/[a-zA-Z]/.test(pass1.value) == false && pass1.value) {
        inputError.style.display = 'block';
        inputError.innerHTML = '<p style="color: red"; >Используйте английский алфавит</p>';
        return false;
    } else {
        inputError.style.display = 'none';
    }
}

let passKostil = false;
pass2.onchange = () => {
    passKostil = true;
}

setInterval(() => {
    if (pass1.value !== pass2.value && pass1.value && pass2.value && passKostil) {
        inputError.style.display = 'block';
        inputError.innerHTML = '<p style="color: red"; >Пароли не совпадают</p>';
        confirmedPass = false;
        passKostil = false;

    } else if (pass1.value === pass2.value && pass1.value && pass2.value && passKostil) {
        inputError.style.display = 'none';
        confirmedPass = true;
        passKostil = false;
    }
}, 500);

setInterval(() => {
    if (companyName.value && userName.value && isOriginalEmail && confirmedPass) {
        submitBtn.style.display = 'block';
    } else {
        submitBtn.style.display = 'none';
    }
}, 100);