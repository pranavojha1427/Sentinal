import http from "http";

const req = http.request({
  hostname: "localhost",
  port: 3000,
  path: "/api/proposals",
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${data}`);
  });
});

req.on("error", console.error);
req.write(JSON.stringify({ project_code: "123", project_name: "Test API" }));
req.end();
