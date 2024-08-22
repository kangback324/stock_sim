function reroad_user() {
  fetch("/api/login-inform")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      document.getElementById("user_id").innerText = data.user_id;
      document.getElementById("money").innerText = data.money;
    })
    .catch((error) => console.error("Fetch error:", error));
}
function account() {
  fetch("/api/account_update_N")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      let j = 0;
      if(data.rr.length <= 0) {
        document.getElementById('1_ac_aver').innerText = "보유중인 주식이 없습니다.";
        return;
      }
      for (let i = 1; i <= data.rr.length; i++) {
        document.getElementById(`${i}_ac_name`).innerText =
          data.rr[j].stock_name;
        document.getElementById(`${i}_ac_number`).innerText =
          data.rr[j].stock_number + " 주";
        document.getElementById(`${i}_ac_aver`).innerText =
          data.rr[j].average_price + " 원";
        if (data.rr[j].stock_price === 0) {
          document.getElementById(`${i}_ac_price_money`).innerText = "-";
          document.getElementById(`${i}_ac_per`).innerText = "-";
        } else {
          document.getElementById(`${i}_ac_per`).innerText =
            (
              ((data.rr[j].stock_price - data.rr[j].average_price) /
                data.rr[j].average_price) *
              100
            ).toFixed(2) + "%";
          document.getElementById(`${i}_ac_price_money`).innerText =
            ((data.rr[j].stock_price - data.rr[j].average_price) * data.rr[j].stock_number).toFixed(2) + " 원";
        }
        j++;
      }
    });
}
function rank() {
  fetch("/api/rank")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      let j = 1;
      for (let i = 0; i < 5; i++) {
        document.getElementById(`r_${j}`).innerText =
          `[${data.rank[i].user_id}] ${data.rank[i].money} 원`;
        j++;
      }
    });
}
reroad_user();
setInterval(() => {
  account();
  rank();
}, 1000);

const socket = io();
socket.on("update_stock", (data) => {
  let j = 0;
  //주식 갱신
  for (let i = 1; i <= data[0].length; i++) {
    const before = document.getElementById(`${i}_price`).innerText;
    document.getElementById(`${i}_price`).innerText = data[0][j].price;
    const after = data[0][j].price;
    if (data[0][j].status == "N") {
      document.getElementById(`${i}_status`).innerText = "상장폐지";
    } else if (data[0][j].price < 500) {
      document.getElementById(`${i}_status`).innerText = "투자경고";
    } else if (data[0][j].price < 1000) {
      document.getElementById(`${i}_status`).innerText = "투자위험";
    } else if (data[0][j].price < 1500) {
      document.getElementById(`${i}_status`).innerText = "투자주의";
    } else {
      document.getElementById(`${i}_status`).innerText = "-";
    }
    document.getElementById(`${i}_pmprice`).innerText = after - before;
    if (document.getElementById(`${i}_pmprice`).innerText === "NaN")
      document.getElementById(`${i}_pmprice`).innerText = "-";
    // 시발 왜 let 으로 해야자 작동하는 거지?
    // 해결 ㅎㅎ == 적야대는데 = 적음 ㅎㅎ
    const per = (((after - before) / before) * 100).toFixed(2);
    if (per == "NaN") document.getElementById(`${i}_per`).innerText = "-";
    else document.getElementById(`${i}_per`).innerText = per;
    j++;
  }
});
