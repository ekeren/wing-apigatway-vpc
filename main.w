bring cloud;
bring http;
bring util;

let api = new cloud.Api() as "my-gateway-behind-vpc";

api.get("/dogs", inflight (req) => {
  return {
    body: "woof",
    status: 200,
  };
});

let url = api.url;
new cloud.Function(inflight () => {
  log("url = {url}");
  let res = http.get("{url}/dogs");
  log("status = {res.status}");
  log("body = {res.body}");
}) as "consumer";
