// API
const participants_url = 'https://mock-api.driven.com.br/api/v6/uol/participants ';
const messages_url = 'https://mock-api.driven.com.br/api/v6/uol/messages/';
const status_url = 'https://mock-api.driven.com.br/api/v6/uol/status';

let username;
let visibility_mode;
let visibility_options;
let typed_username;
let array_mensagens;
let recipient_user;
let refresh_chat_time_interval;
let array_participantes;
let refresh_participants_time_interval;
let intervalo_atualização;

let DOM_menu_lateral = document.querySelector('.menu_lateral');
let DOM_topo = document.querySelector('.topo');
let DOM_telaInicio = document.querySelector('.telaInicio');
let DOM_username_input = document.querySelector('.telaInicio input');
let DOM_user_invalido_janelinha = document.querySelector('.user_invalido_janelinha');
let DOM_mensagem_invalida_janelinha = document.querySelector('.mensagem_invalida_janelinha');
let DOM_carregando = document.querySelector('.carregando');
let DOM_message_input = document.querySelector('.base textarea');
let DOM_conteudo = document.querySelector('.conteudo');
let DOM_mensagem_box = document.querySelector('.mensagem_box');
let DOM_visibility_menu = document.querySelector('.visibility_menu');
let DOM_message_input_placeholder = document.querySelector('.base .placeholder');
let DOM_user_menu = document.querySelector('.user_menu');
let DOM_base = document.querySelector('.base');

//logar
function logar(){

    typed_username = DOM_username_input.value;
    DOM_username_input.value = '';
    if (typed_username.trim().length === 0 || !String(typed_username)){
        DOM_user_invalido_janelinha.style.opacity = 0.6;
        DOM_user_invalido_janelinha.innerHTML = "Insira um nome de usuário válido"
        setTimeout(function(){ DOM_user_invalido_janelinha.style.opacity = 0;
                               DOM_user_invalido_janelinha.innerHTML = ""; }, 2000);
    }
    else {
        DOM_user_invalido_janelinha.style.opacity = 0;
        DOM_user_invalido_janelinha.innerHTML = "";
        const SERVER_user_name_sent_promise = axios({
                                                method: 'post',
                                                url: participants_url,
                                                data: {
                                                  name: typed_username,
                                                }
                                              });
        SERVER_user_name_sent_promise.then(resposta_nick)
                                     .catch(erro_nick);
    }
}

// status e atualizações
function set_chat(){
    intervalo_atualizar();
    buscar_mensagens_API();
    buscar_participantes();
    reset_chat();
    reset_participante();
}

// resposta nick
function resposta_nick(answer) {
    if(answer.status == 200){
        username = typed_username;
        set_chat();
        DOM_message_input.addEventListener("keyup", ({key}) => {
                if (key === "Enter") {
                    enviar_mensagem();
                }
            });
        DOM_telaInicio.classList.toggle('display');
        DOM_carregando.classList.toggle('display');
        setTimeout(function(){ DOM_carregando.classList.toggle('display');
                               DOM_conteudo.classList.toggle('display');}, 2000);
    }
    else{
        return;
    }
}

//  erro no nick, loop
function erro_nick(error){
    
    if (error.response.status == 400){
        DOM_user_invalido_janelinha.style.opacity = 0.8;
        DOM_user_invalido_janelinha.innerHTML = "Nome em uso, favor digitar outro";
        setTimeout(function(){ DOM_user_invalido_janelinha.style.opacity = 0;
                               DOM_user_invalido_janelinha.innerHTML = ""; }, 2000);
    }
}

// status checker ping
function intervalo_atualizar(){

    intervalo_atualização = setInterval(function () {
                                        axios({
                                            method: 'post',
                                            url: status_url,
                                            data: {
                                              name: username,
                                            }
                                        });
                                        console.log('ping');
                                     }, 5000);
}

// menu lateral clicavel
function mover_menu_lateral(mode) {

    if (mode == 'show'){
        DOM_menu_lateral.style.right = 0;
    }
    else if (mode == 'hide'){
        DOM_menu_lateral.style.right = "-259px";
        
    }
}

// visibilade e auteração 
function mudar_display(i) {

    const DOM_visibility_options = DOM_visibility_menu.querySelectorAll('.option');

    for (let j = 0; j < DOM_visibility_options.length; j++) {
        DOM_visibility_options[j].querySelector('.option_content').innerHTML = `<p>${visibility_options[j]}</p>`;
    }

    DOM_visibility_options[i].querySelector('.option_content').innerHTML += `<ion-icon name="checkmark-sharp"></ion-icon>`;
    visibility_mode = visibility_options[i];

    if (recipient_user != undefined){
        if (visibility_mode == 'livre'){
            DOM_message_input_placeholder.innerHTML = `
            Escreva aqui
                <div>
                        Enviando para ${recipient_user}
                </div>
            `;
        }
        else{
            DOM_message_input_placeholder.innerHTML = `
            Escreva aqui
                <div>
                    Enviando para ${recipient_user} (pessoal)
                </div>
            `;
        }
    }
    else{
        DOM_message_input_placeholder.innerHTML = `
            Escreva aqui
        `;
    }
}

// mudança de destinatario
function change_recipient(i){

    const DOM_user_options = DOM_user_menu.querySelectorAll('.option');

    for (let j = 0; j < DOM_user_options.length; j++) {
        DOM_user_options[j].querySelector('.option_content').innerHTML = `<p>${array_participantes[j]}</p>`;
    }

    DOM_user_options[i].querySelector('.option_content').innerHTML += `<ion-icon name="checkmark-sharp"></ion-icon>`;
    recipient_user = array_participantes[i];

    if (visibility_mode == 'livre'){
        DOM_message_input_placeholder.innerHTML = `
            Escreva aqui
            <div>
                Enviando para ${recipient_user}
            </div>
         `;
    }
    else{
        DOM_message_input_placeholder.innerHTML = `
            Escreva aqui
            <div>
                Enviando para ${recipient_user} (pessoal)
            </div>
        `;
    }
    
}

// auto-scroll
function scroll_last_message_into_view(){

    const messages = DOM_mensagem_box.querySelectorAll('.message');
    const last_message = messages[messages.length - 1];

    last_message.scrollIntoView();
}

// popular chat
function fill_chat(){

    let message_div;
    DOM_mensagem_box.innerHTML = '';

    for (let i = 0; i < array_mensagens.length; i++) {
        const message_type = array_mensagens[i].type;
        const message_time = array_mensagens[i].time;
        const message_from = array_mensagens[i].from;
        const message_text = array_mensagens[i].text;
        const message_to = array_mensagens[i].to;
        
        if (message_type == 'status'){
            message_div = `
                <div class="message status">
                    <span class="time">(${message_time})</span>
                     <span class="conteudo_mensagem"><span class="username">${message_from}</span> ${message_text}</span>
                </div>
            `;
            DOM_mensagem_box.innerHTML += message_div;
        }
        else if (message_type == 'message'){
            message_div = `
                <div class="message regular">
                    <span class="time">(${message_time})</span>
                    <span class="conteudo_mensagem"><span class="username">${message_from}</span> para <span class="username">${message_to}:</span> ${message_text}</span>
                </div>
            `;
            DOM_mensagem_box.innerHTML += message_div;
        }
        else if (message_type == 'privado'){
            if (username == message_to || username == message_from){
                message_div = `
                    <div class="message privado">
                        <span class="time">(${message_time})</span>
                        <span class="conteudo_mensagem"><span class="username">${message_from}</span> pessoal para <span class="username">${message_to}:</span> ${message_text}</span>
                    </div>
                `;
                DOM_mensagem_box.innerHTML += message_div;
            }
        }
        else{
            throw new Error('Invalid message type!');
        }
    }

    scroll_last_message_into_view();
}

// buscar conteudo API
function buscar_mensagens_API(){

    const SERVER_fetch_messages_promise = axios.get(messages_url);
    SERVER_fetch_messages_promise.then(SERVER_process_fetch_messages_answer);
}

// resposta API
function SERVER_process_fetch_messages_answer(answer) {

    array_mensagens = answer.data;
    fill_chat();
}

// intervalo busca mensagem
function reset_chat(){

    refresh_chat_time_interval = setInterval(function () {
        buscar_mensagens_API();
        console.log('fetching messages from server');
    }, 3000);
}

// envio de mensagem local
function enviar_mensagem(){

    let conteudo_mensagem = DOM_message_input.value;
    let message_to;
    let message_type;
    DOM_message_input.value = '';

    if(conteudo_mensagem.trim().length != 0 && String(conteudo_mensagem)){
        if (recipient_user != undefined){
            let recipient_user_index = array_participantes.indexOf(recipient_user);
            if (recipient_user_index != -1){
                message_to = array_participantes[recipient_user_index];
            }
            else{
                show_mensagem_invalida_janelinha('Destinatário ausente do chat!');
                DOM_message_input_placeholder.innerHTML = `
                    Escreva Aqui
                `;
                return;
            }
        }
        else{
            show_mensagem_invalida_janelinha('Escolha um destinatário primeiro!');
            return;
        }
        if(message_to == username){
            show_mensagem_invalida_janelinha('Não é possível enviar mensagens para próprio usuário!');
            return;
        }
        if (visibility_mode=='livre'){
            message_type = 'message'
        }
        else{
            message_type = 'mensagem_privada';
            if(message_to == 'Todos'){
                show_mensagem_invalida_janelinha('Não é possível enviar uma mensagem privada para todos!');
                return;
            }
        }
        const SERVER_message_sent_promise = axios({
                method: 'post',
                url: messages_url,
                data: {
                    from: username,
                    to: message_to,
                    text: conteudo_mensagem,
                    type: message_type
                 }
            });
        SERVER_message_sent_promise.then(SERVER_process_message_sent_answer)
            .catch(SERVER_process_message_sent_error);
    }
    else{
        show_mensagem_invalida_janelinha('Mensagem inválida!');
        return;
    }
}

// envio mensagem API
function SERVER_process_message_sent_answer(answer){

    if(answer.status == 200){
        buscar_mensagens_API();
    }
    else{
        return;
    }
}

// lista de participantes
function buscar_participantes(){

    const SERVER_fetch_participants_promise = axios.get(participants_url);
    SERVER_fetch_participants_promise.then(SERVER_process_fetch_participants_answer)
        .catch(function (error){
            throw new Error('Could not get participants from server!');
        });
}

function SERVER_process_fetch_participants_answer(answer){

    const data = answer.data;
    array_participantes = ['Todos'];
    for (let i = 0; i < data.length; i++) {
        array_participantes.push(data[i].name);
    }
    menu_lateral_participantes();
}

// intervalo buscar user API
function reset_participante(){

    refresh_participants_time_interval = setInterval(function () {
         buscar_participantes();
            console.log('fetching participants from server');
        }, 10000);
}

// exibir participantes menu lateral
function menu_lateral_participantes(){

    DOM_user_menu.innerHTML = '';

    for (let i = 0; i < array_participantes.length; i++) {
        const participant_div = `<div class="option" onclick="change_recipient(${i})" data-identifier="participant">
                                    <ion-icon name="person-circle"></ion-icon>
                                    <div class="option_content">
                                        ${array_participantes[i]}
                                    </div>
                                </div>`;
        DOM_user_menu.innerHTML += participant_div;
    }

    const DOM_user_options = DOM_user_menu.querySelectorAll('.option');

    if (recipient_user != undefined){
        let recipient_user_index = array_participantes.indexOf(recipient_user);
        if (recipient_user_index != -1){
            DOM_user_options[recipient_user_index].querySelector('.option_content').innerHTML += `<ion-icon name="checkmark-sharp"></ion-icon>`;
        }
        else{
            recipient_user = undefined;
            show_mensagem_invalida_janelinha('Destinatário ausente');
            DOM_message_input_placeholder.innerHTML = `
                Escreva aqui
             `;
        }
    }
}

// janela, mensagem ivnalida
function show_mensagem_invalida_janelinha(message_string){

    DOM_mensagem_invalida_janelinha.style.opacity = 0.8;
    DOM_mensagem_invalida_janelinha.innerHTML = message_string;
    setTimeout(function(){ DOM_mensagem_invalida_janelinha.style.opacity = 0;
        DOM_mensagem_invalida_janelinha.innerHTML = ""; }, 2000);
}

// inicializar chat
function iniciar(){
    visibility_mode = 'livre';
    recipient_user = undefined;
    array_participantes = ['Todos'];
    visibility_options = ['livre', 'Reservadamente']

    DOM_telaInicio.addEventListener("keyup", ({key}) => {
        if (key === "Enter") {
            logar();
        }
    });
}


iniciar();