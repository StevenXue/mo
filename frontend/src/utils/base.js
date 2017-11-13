function format(data, type) {
  switch (type) {
    case 'int':
      return parseInt(data);
    case 'float':
      return parseFloat(data);
    case 'str':
      console.log("todo str 怎么办");
      return data;
    default:
      console.err("未知类型");
      return data;
  }
}

function unifyType(type){
  switch (type) {
    case 'integer': return 'int';

    default:
      return type
  }
}

module.exports = {
  format,
  unifyType
}
