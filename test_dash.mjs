import http from "http";

const req = http.request("http://localhost:3000/dashboard", (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    if(res.statusCode === 500) {
      console.log(data.substring(0, 1000));
    }
  });
});
req.end();
