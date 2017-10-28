function format(data, type) {
  switch (type) {
    case 'int':
      return parseInt(data)
  }

}

module.exports = {
  format
}
