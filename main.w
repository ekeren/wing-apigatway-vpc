bring cloud;
bring  http;
bring util;
let api = new cloud.Api() as "randi1";

api.get("/dogs", inflight (req) => {
  return {
    body: "woof2",
    status: 200,
  };
});

let url = api.url;
new cloud.Function(inflight () => {
  log("url = {url}");
  let res = http.get("{url}/dogs");
  log("status = {res.status}");
  log("body = {res.body}");
  
}) as "rinda1";