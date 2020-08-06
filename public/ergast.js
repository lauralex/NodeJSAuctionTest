
$(function () {
  const socket = io();
  const FADE_TIME = 150;
  const $window = $(window);
  const $usernameInput = $('.usernameInput');
  const $loginPage = $('.login.page');
  const $chatPage = $('.chat.page');
  const $audioNotify = new Audio("/insight.ogg");
  const $audioStop = new Audio("/gavel.ogg");

  const inboxPeople = document.querySelector(".inbox__people");

  let userName = "";
  let connected = false;
  const $currentInput = $usernameInput.focus();

  const cleanInput = (input) => {
    return $('<div/>').text(input).html();
  }

  const setUsername = () => {
    userName = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (userName) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      

      // Tell the server your username
      socket.emit('new user', userName);
      addToUsersBox(userName);
    }
  }

  /*
  const newUserConnected = (user) => {
    userName = user || `User${Math.floor(Math.random() * 1000000)}`;
    socket.emit("new user", userName);
    addToUsersBox(userName);
  };
  */

  const addToUsersBox = (userName) => {
    if (!!document.querySelector(`.${userName}-userlist`)) {
      return;
    }

    const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
    inboxPeople.innerHTML += userBox;
  };

  // new user is created so we generate nickname and emit event
  //newUserConnected();

  socket.on("new user", function (data) {
    inboxPeople.innerHTML = `<h4>Active users</h4>`;
    data.map((user) => addToUsersBox(user));
  });

  socket.on("user disconnected", function (userName) {
    const userList = document.querySelector(`.${userName}-userlist`);
    if (userList) {
      userList.remove();
    }
  });


  const messageForm = document.querySelector(".message_form");
  const loginForm = document.querySelector(".login_form");
  const messageBox = document.querySelector(".messages__history");

  const addNewMessage = ({ user, message }) => {
    const time = new Date();
    const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

    const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <!-- <span class="time_date">${formattedTime}</span> -->
      </div>
    </div>
  </div>`;

    const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <!-- <span class="time_date">${formattedTime}</span> -->
      </div>
    </div>
  </div>`;

    // messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
    messageBox.innerHTML += receivedMsg;
    if (user) {
      $audioNotify.play();
    }
    else if (message == "STOP!") {
      $audioStop.play();
    } 
  };

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();


    socket.emit("chat message", {
      message: "",
      nick: userName,
    });


  });

  socket.on("reconnect", () => {
    if (userName) {
      socket.emit("new user", userName);
    }
  })

  socket.on("chat message", function (data) {
    addNewMessage({ user: data.nick, message: data.message });
    document.querySelector(".fallback").scrollIntoView();
  });

  $loginPage.click(() => {
    $currentInput.focus();
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    setUsername();
  })
});