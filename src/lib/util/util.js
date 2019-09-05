

/**
 * 
 * @param {*} timeMs 
 */
const sleep = async (timeMs) => {
  return new Promise((resolve, reject) => setTimeout(resolve, timeMs))
}

module.exports = {
  sleep
}