import * as fs from "fs";
import request from "request";

const { URL } = require("url");
const DIRECTORY = "./data/out/";

async function getJsonKeyFromFile(filename) {
  var r1 = await readJsonDataFromFilename(filename, "utf8");
  var r2 = r1.trim();
  var r3 = JSON.parse(r2);
  var r4 = r3.key;
  return r4;
}

async function writeJsonDataToFilename(fileNameIn, data, type) {
  let fileName = DIRECTORY + fileNameIn;

  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, type, err => {
      if (err) {
        reject(err);
      }
      resolve(fileName);
    });
  });
}

async function readJsonDataFromFilename(fileName, type) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, type, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

function getCityStateFromApi(api) {
  let myURL = new URL(api);
  let params = myURL.searchParams.get("q");
  let locationary = params.split(":");

  let citystate = locationary[1];
  citystate = citystate.substr(1).slice(0, -1);
  citystate = citystate.split(",");

  let city = citystate[0];
  let state = citystate[1];
  let result = state + "-" + city + ".js";

  return result;
}

// Takes in a string and returns the city and the state in an Array
function getCityState(input) {
  var city, state;
  var cityStateAry1 = input.split(",");
  var cityStateAry2 = [];
  cityStateAry2[0] = cityStateAry1[0].trim();
  cityStateAry2[1] = cityStateAry1[1].trim();
  return cityStateAry2;
}

function buildApi(cityStateAry) {
  var city = encodeURIComponent(cityStateAry[0]);
  var state = cityStateAry[1];
  return `https://api.github.com/search/users?q=location%3A%22${city}%2c${state}%22`;
}

function buildCityApiAry(cityAry) {
  var apiAry = [];
  var ary = JSON.parse(cityAry);
  var arrayLength = ary.length;
  console.log(arrayLength);
  for (var i = 0; i < arrayLength; i++) {
    var cityStateAry = getCityState(ary[i]);
    var myapi = buildApi(cityStateAry);
    apiAry.push(myapi);
  }
  return apiAry;
}

async function getGithubData(api, key) {
  var options = {
    uri: api,

    qs: {
      access_token: key
    },

    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true // Automatically parses the JSON string in the response
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(body);
    });
  });
}

async function process(filename, api, apikey) {
  let githubData = await getGithubData(api, apikey);

  // Do NOT forget to stringify the JSON !!
  githubData = JSON.stringify(githubData);

  let writeResult = await writeJsonDataToFilename(filename, githubData, "utf8");
  console.log(`${writeResult} has been saved.`);
}

async function go() {
  let githubApiKey = await getJsonKeyFromFile("./data/f1.js");
  let cities = await readJsonDataFromFilename("./data/cities-small.js", "utf8");
  let apiAry = buildCityApiAry(cities);

  let arrayLength = apiAry.length;
  for (var i = 0; i < arrayLength; i++) {
    let cityStateFilename = getCityStateFromApi(apiAry[i]);
    await process(cityStateFilename, apiAry[i], githubApiKey);
  }
}

go();
