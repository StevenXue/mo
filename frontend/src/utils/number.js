const getRound= (num,len) => {
  return Math.round(num * Math.pow(10, len)) / Math.pow(10, len);
};

module.exports = {
  getRound,
};
