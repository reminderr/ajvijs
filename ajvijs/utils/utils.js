
export default Array.prototype.paginate = function(pageNumber, itemsPerPage){
  pageNumber   = Number(pageNumber)
  itemsPerPage = Number(itemsPerPage)
  pageNumber   = (pageNumber   < 1 || isNaN(pageNumber))   ? 1 : pageNumber
  itemsPerPage = (itemsPerPage < 1 || isNaN(itemsPerPage)) ? 1 : itemsPerPage

  var start     = ((pageNumber - 1) * itemsPerPage)
  var end       = start + itemsPerPage
  var loopCount = 0
  var result    = {
    data: [],
    end: false
  }

  for(loopCount = start; loopCount < end; loopCount++){
    this[loopCount] && result.data.push(this[loopCount]);
  }

  if(loopCount == this.length) {
    result.end = true
  }

  return result
}

export const getScrollCoordinate = (el = window) => ({
  x: el.pageXOffset || el.scrollLeft,
  y: el.pageYOffset || el.scrollTop,
})

export const formatDate = (todelimit, _date) => {
    let delimiter = todelimit.replace(/[a-zA-Z]*/g, '').split('').shift()
    let date = todelimit.split(delimiter)
    let inpdate = _date.split('-')
    let outputdate = ''
    date.forEach(part => {
      switch(part.toLowerCase()) {
        case 'd':         
          if(inpdate[2].toString().substr(0, 1) == '0') {
            outputdate += inpdate[2].toString().substr(1, 1)+delimiter
          } else {
            outputdate += inpdate[2]+delimiter
          }
        break
        case 'dd':
          outputdate += inpdate[2]+delimiter
        break
        case 'm':
          if(inpdate[1].toString().substr(0, 1) == '0') {
            outputdate += inpdate[1].toString().substr(1, 1)+delimiter
          } else {
            outputdate += inpdate[1]+delimiter
          }
        break
        case 'mm':
          outputdate += inpdate[1]+delimiter
        break
        case 'yy':
          outputdate += inpdate[0].toString().substr(2, 2)+delimiter
        break
        case 'yyyy':
          outputdate += inpdate[0]+delimiter
        break
      }
    })
    return outputdate.substr(0, outputdate.length - 1)
}

export const dateToISO = (todelimit, format) => {
    let fdelimiter = format.replace(/[a-zA-Z]*/g, '').split('').shift() 
    let fdate = format.split(fdelimiter)  
    let delimiter = todelimit.replace(/[0-9]*/g, '').split('').shift()
    let date = todelimit.split(delimiter)
    let d = new Date()
    let outputdate = ''
    if(fdate[0].length == 4 && fdate[0].match(/Y/)) {
      outputdate += date[0]+'-'
    }
    if(fdate[1].length == 4 && fdate[1].match(/Y/)) {
      outputdate += date[1]+'-'
    }
    if(fdate[2].length == 4 && fdate[2].match(/Y/)) {
      outputdate += date[2]+'-'
    }
    if(fdate[0].length == 2 && fdate[0].match(/Y/)) {
      outputdate += d.getFullYear().substr(0, 2)+date[0]+'-'
    }
    if(fdate[1].length == 2 && fdate[1].match(/Y/)) {
      outputdate += d.getFullYear().substr(0, 2)+date[1]+'-'
    }
    if(fdate[2].length == 2 && fdate[2].match(/Y/)) {
      outputdate += d.getFullYear().substr(0, 2)+date[2]+'-'
    }
    if(fdate[0].length == 2 && fdate[0].match(/m/)) {
      outputdate += date[0]+'-'
    }
    if(fdate[1].length == 2 && fdate[1].match(/m/)) {
      outputdate += date[1]+'-'
    }
    if(fdate[2].length == 2 && fdate[2].match(/m/)) {
      outputdate += date[2]+'-'
    }
    if(fdate[0].length == 1 && fdate[0].match(/m/)) {
      outputdate += '0'+date[0]+'-'
    }
    if(fdate[1].length == 1 && fdate[1].match(/m/)) {
      outputdate += '0'+date[1]+'-'
    }
    if(fdate[2].length == 1 && fdate[2].match(/m/)) {
      outputdate += '0'+date[2]+'-'
    }
    if(fdate[0].length == 2 && fdate[0].match(/d/)) {
      outputdate += date[0]+'-'
    }
    if(fdate[1].length == 2 && fdate[1].match(/d/)) {
      outputdate += date[1]+'-'
    }
    if(fdate[2].length == 2 && fdate[2].match(/d/)) {
      outputdate += date[2]+'-'
    }
    if(fdate[0].length == 1 && fdate[0].match(/d/)) {
      outputdate += '0'+date[0]+'-'
    }
    if(fdate[1].length == 1 && fdate[1].match(/d/)) {
      outputdate += '0'+date[1]+'-'
    }
    if(fdate[2].length == 1 && fdate[2].match(/d/)) {
      outputdate += '0'+date[2]+'-'
    }
    return outputdate.substr(0, outputdate.length - 1)
}

export const dateToInt = (d, f) => {
    let date = d.match(/\-/) ? d.split('-') : dateToISO(d, f).split('-')
    let nd = new Date(date[0], parseInt(date[1]) - 1, date[2])
    return nd.getTime()
}

export const dateTimeToInt = (dt, f) => {
    let parts = dt.split(' ')
    let d = parts[0].match(/\-/) ? parts[0].split('-') : dateToISO(parts[0], f).split('-')
    let t = parts[1].split(':')
    let nd = new Date(d[0], parseInt(d[1]) - 1, d[2], t[0], t[1], t[2])
    return nd.getTime()
}

export const timeToInt = time => {
    let date = new Date()
    let t = time.split(':')
    let nd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), t[0], t[1], t[2])
    return nd.getTime()
}

export const setOwner = el => {
    return el.tagName.toLowerCase().replace(/(a|e|i|o|u|)/gi, '').replace(/[^\w\s]|(.)(?=\1)/gi, '')+Math.random().toString().split('.')[1]
}