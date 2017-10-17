const arrayToJson = (array, key) => {
  let finalJson = {};
  for (let i of array) {
    finalJson[i[key]] = i;
  }
  return finalJson
};

const JsonToArray = (json) => {
  let arr = [];
  for (let prop in json) {
    arr.push(json[prop]);
  }
  return arr
};

module.exports = {
  arrayToJson,
  JsonToArray,
};
