export const drawRect = function (elem, rectData) {
  const rectElem = elem.append('rect')
  rectElem.attr('x', rectData.x)
  rectElem.attr('y', rectData.y)
  rectElem.attr('fill', rectData.fill)
  rectElem.attr('stroke', rectData.stroke)
  rectElem.attr('width', rectData.width)
  rectElem.attr('height', rectData.height)
  rectElem.attr('rx', rectData.rx)
  rectElem.attr('ry', rectData.ry)

  if (typeof rectData.class !== 'undefined') {
    rectElem.attr('class', rectData.class)
  }

  return rectElem
}

export const drawImage = function (elem, rectData, actorImage) {
  const imgElem = elem.append('image')

  imgElem.attr('xlink:href', actorImage)
  imgElem.attr('x', rectData.x + 50) // half image size  - hard coded to 100px
  imgElem.attr('y', rectData.y - 150)
  imgElem.attr('width', '100px')
  imgElem.attr('height', '100px')

  if (typeof rectData.class !== 'undefined') {
    imgElem.attr('class', rectData.class)
  }

  return imgElem
}

export const drawImageSVG = function (elem, rectData, imageKey) {
  const imgElem = elem.append('g')
  imgElem.attr('transform', 'translate('+(rectData.x + 62)+', '+(rectData.y + 10)+')');
  imgElem.html(myActorImgs[imageKey]);
  return imgElem
}

export const drawText = function (elem, textData, width) {
  // Remove and ignore br:s
  const nText = textData.text.replace(/<br\/?>/ig, ' ')

  const textElem = elem.append('text')
  textElem.attr('x', textData.x)
  textElem.attr('y', textData.y)
  textElem.style('text-anchor', textData.anchor)
  textElem.attr('fill', textData.fill)
  if (typeof textData.class !== 'undefined') {
    textElem.attr('class', textData.class)
  }

  const span = textElem.append('tspan')
  span.attr('x', textData.x + textData.textMargin * 2)
  span.attr('fill', textData.fill)
  span.text(nText)

  return textElem
}

export const drawLabel = function (elem, txtObject) {
  function genPoints (x, y, width, height, cut) {
    return x + ',' + y + ' ' +
      (x + width) + ',' + y + ' ' +
      (x + width) + ',' + (y + height - cut) + ' ' +
      (x + width - cut * 1.2) + ',' + (y + height) + ' ' +
      (x) + ',' + (y + height)
  }
  const polygon = elem.append('polygon')
  polygon.attr('points', genPoints(txtObject.x, txtObject.y, 50, 20, 7))
  polygon.attr('class', 'labelBox')

  // Save these positions for when I redraw polygon
  let oldX = txtObject.x
  let oldY = txtObject.y

  txtObject.y = txtObject.y + txtObject.labelMargin
  txtObject.x = txtObject.x + 0.5 * txtObject.labelMargin
  var textElem = drawText(elem, txtObject)

  // This extra little bit will set size of polygon to the size of the text inside
  let textWidth = (textElem._groups || textElem)[0][0].getBBox().width
  polygon.attr('points', genPoints(oldX, oldY, textWidth + 40, 25, 25))
}

let actorCnt = -1
/**
 * Draws an actor in the diagram with the attaced line
 * @param center - The center of the the actor
 * @param pos The position if the actor in the liost of actors
 * @param description The text in the box
 */
export const drawActor = function (elem, left, verticalPos, description, conf, key) {
  const center = left + (conf.width / 2)
  const g = elem.append('g')
  if (verticalPos === 0) {
    actorCnt++
    g.append('line')
      .attr('id', 'actor' + actorCnt)
      .attr('x1', center)
      .attr('y1', 5)
      .attr('x2', center)
      .attr('y2', 2000)
      .attr('class', 'actor-line')
      .attr('stroke-width', '0.5px')
      .attr('stroke', '#999')
  }

  const rect = getNoteRect()
  rect.x = left
  rect.y = verticalPos
  rect.fill = '#eaeaea'
  rect.width = conf.width
  rect.height = conf.height
  rect.class = 'actor'
  rect.rx = 3
  rect.ry = 3

  if (conf.actorImages && conf.actorImages[key]) {
    // drawImage(g, rect, conf.actorImages[key])
    rect.class = 'actor-image';
    rect.fill = conf.actorImageBackground;
    drawRect(g, rect)
    drawImageSVG(g, rect, conf.actorImages[key])
    rect.y = (rect.y + 40) // pull text up a bit // TO DO - remove magic number
  } else {
    drawRect(g, rect)
  }

  _drawTextCandidateFunc(conf)(description, g,
    rect.x, rect.y, rect.width, rect.height, { 'class': 'actor' })
}

export const anchorElement = function (elem) {
  return elem.append('g')
}
/**
 * Draws an actor in the diagram with the attaced line
 * @param elem - element to append activation rect
 * @param bounds - activation box bounds
 * @param verticalPos - precise y cooridnate of bottom activation box edge
 */
export const drawActivation = function (elem, bounds, verticalPos, conf, actorActivations) {
  const rect = getNoteRect()
  const g = bounds.anchored
  rect.x = bounds.startx
  rect.y = bounds.starty
  rect.class = 'activation' + (actorActivations % 3) // Will evaluate to 0, 1 or 2
  rect.width = bounds.stopx - bounds.startx
  rect.height = verticalPos - bounds.starty
  drawRect(g, rect)
}

/**
 * Draws an actor in the diagram with the attaced line
 * @param center - The center of the the actor
 * @param pos The position if the actor in the list of actors
 * @param description The text in the box
 */
export const drawLoop = function (elem, bounds, labelText, conf) {
  const g = elem.append('g')
  const drawLoopLine = function (startx, starty, stopx, stopy) {
    return g.append('line')
      .attr('x1', startx)
      .attr('y1', starty)
      .attr('x2', stopx)
      .attr('y2', stopy)
      .attr('class', 'loopLine')
  }
  // Removing lines in favor of rect (below)
  // drawLoopLine(bounds.startx, bounds.starty, bounds.stopx, bounds.starty)
  // drawLoopLine(bounds.stopx, bounds.starty, bounds.stopx, bounds.stopy)
  // drawLoopLine(bounds.startx, bounds.stopy, bounds.stopx, bounds.stopy)
  // drawLoopLine(bounds.startx, bounds.starty, bounds.startx, bounds.stopy)
  if (typeof bounds.sections !== 'undefined') {
    bounds.sections.forEach(function (item) {
      drawLoopLine(bounds.startx, item, bounds.stopx, item).style('stroke-dasharray', '3, 3')
    })
  }

  // Draw a rect instead of 4 lines (above)
  drawRect(elem, {
    x: bounds.startx,
    y: bounds.starty,
    fill: 'rgba(145,122,76,0.05)',
    stroke: '#D3CFC8',
    width: (bounds.stopx - bounds.startx),
    height: (bounds.stopy - bounds.starty),
    rx: 0,
    ry: 0,
    class: ''
  })

  let txt = getTextObj()
  txt.text = bounds.title // previously 'labelText'
  txt.x = bounds.startx
  txt.y = bounds.starty
  txt.labelMargin = 17 // 1.5 * 10 // This is the small box that says "loop"
  txt.class = 'labelText' // Its size & position are fixed.

  drawLabel(g, txt)

  // Commenting out section to draw label, as it has been moved elsewhere
  // txt = getTextObj()
  // txt.text = '[ ' + bounds.title + ' ]'
  // txt.x = bounds.startx + (bounds.stopx - bounds.startx) / 2
  // txt.y = bounds.starty + 1.5 * conf.boxMargin
  // txt.anchor = 'middle'
  // txt.class = 'loopText'

  // drawText(g, txt)

  if (typeof bounds.sectionTitles !== 'undefined') {
    bounds.sectionTitles.forEach(function (item, idx) {
      if (item !== '') {
        txt.text = '[ ' + item + ' ]'
        txt.y = bounds.sections[idx] + 1.5 * conf.boxMargin
        drawText(g, txt)
      }
    })
  }
}

/**
 * Setup arrow head and define the marker. The result is appended to the svg.
 */
export const insertArrowHead = function (elem) {
  elem.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('refX', 7) // orig value: 5
    .attr('refY', 4) // orig value: 2
    .attr('markerWidth', 8) // orig value: 6
    .attr('markerHeight', 8) // orig value: 4
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 0,0 V 8 L 8,4 Z') // orig value: 'M 0,0 V 4 L6,2 Z'
}
/**
 * Setup node number. The result is appended to the svg.
 */
export const insertSequenceNumber = function (elem) {
  elem.append('defs').append('marker')
    .attr('id', 'sequencenumber')
    .attr('refX', 15)
    .attr('refY', 15)
    .attr('markerWidth', 60)
    .attr('markerHeight', 40)
    .attr('orient', 'auto')
    .append('circle')
    .attr('cx', 15)
    .attr('cy', 15)
    .attr('r', 6)
    // .style("fill", '#f00');
}
/**
 * Setup arrow head and define the marker. The result is appended to the svg.
 */
export const insertArrowCrossHead = function (elem) {
  const defs = elem.append('defs')
  const marker = defs.append('marker')
    .attr('id', 'crosshead')
    .attr('markerWidth', 15)
    .attr('markerHeight', 8)
    .attr('orient', 'auto')
    .attr('refX', 16)
    .attr('refY', 4)

  // The arrow
  marker.append('path')
    .attr('fill', 'black')
    .attr('stroke', '#000000')
    .style('stroke-dasharray', ('0, 0'))
    .attr('stroke-width', '1px')
    .attr('d', 'M 9,2 V 6 L16,4 Z')

  // The cross
  marker.append('path')
    .attr('fill', 'none')
    .attr('stroke', '#000000')
    .style('stroke-dasharray', ('0, 0'))
    .attr('stroke-width', '1px')
    .attr('d', 'M 0,1 L 6,7 M 6,1 L 0,7')
  // this is actual shape for arrowhead
}

export const getTextObj = function () {
  const txt = {
    x: 0,
    y: 0,
    'fill': 'black',
    'text-anchor': 'start',
    style: '#666',
    width: 100,
    height: 100,
    textMargin: 0,
    rx: 0,
    ry: 0
  }
  return txt
}

export const getNoteRect = function () {
  const rect = {
    x: 0,
    y: 0,
    fill: '#EDF2AE',
    stroke: '#666',
    width: 100,
    anchor: 'start',
    height: 100,
    rx: 0,
    ry: 0
  }
  return rect
}

const _drawTextCandidateFunc = (function () {
  function byText (content, g, x, y, width, height, textAttrs) {
    const text = g.append('text')
      .attr('x', x + width / 2).attr('y', y + height / 2 + 5)
      .style('text-anchor', 'middle')
      .text(content)
    _setTextAttrs(text, textAttrs)
  }

  function byTspan (content, g, x, y, width, height, textAttrs) {
    const text = g.append('text')
      .attr('x', x + width / 2).attr('y', y)
      .style('text-anchor', 'middle')
    text.append('tspan')
      .attr('x', x + width / 2).attr('dy', '0')
      .text(content)

    text.attr('y', y + height / 2.0)
      .attr('dominant-baseline', 'central')
      .attr('alignment-baseline', 'central')

    _setTextAttrs(text, textAttrs)
  }

  function byFo (content, g, x, y, width, height, textAttrs) {
    const s = g.append('switch')
    const f = s.append('foreignObject')
      .attr('x', x).attr('y', y)
      .attr('width', width).attr('height', height)

    const text = f.append('div').style('display', 'table')
      .style('height', '100%').style('width', '100%')

    text.append('div').style('display', 'table-cell')
      .style('text-align', 'center').style('vertical-align', 'middle')
      .text(content)

    byTspan(content, s, x, y, width, height, textAttrs)
    _setTextAttrs(text, textAttrs)
  }

  function _setTextAttrs (toText, fromTextAttrsDict) {
    for (const key in fromTextAttrsDict) {
      if (fromTextAttrsDict.hasOwnProperty(key)) {
        toText.attr(key, fromTextAttrsDict[key])
      }
    }
  }

  return function (conf) {
    return conf.textPlacement === 'fo' ? byFo : (
      conf.textPlacement === 'old' ? byText : byTspan)
  }
})()

export default {
  drawRect,
  drawText,
  drawLabel,
  drawActor,
  anchorElement,
  drawActivation,
  drawLoop,
  insertArrowHead,
  insertSequenceNumber,
  insertArrowCrossHead,
  getTextObj,
  getNoteRect
}

var myActorImgs = [];
myActorImgs['mastercard_logo'] = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg width="80" height="80" viewbox="0 0 200 200" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
 <metadata>
  <rdf:RDF>
   <cc:Work rdf:about="">
    <dc:format>image/svg+xml</dc:format>
    <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/>
    <dc:title/>
   </cc:Work>
  </rdf:RDF>
 </metadata>
 <g transform="translate(1565.7 -1080)">
  <g transform="matrix(3.1437 0 0 3.1437 -4835.7 -1027.6)">
   <g transform="matrix(1.25 0 0 -1.25 1102.5 727.74)">
    <path d="m0 0v-0.103h0.095c0.021 0 0.039 5e-3 0.052 0.013 0.012 8e-3 0.019 0.022 0.019 0.039s-7e-3 0.03-0.019 0.038c-0.013 9e-3 -0.031 0.013-0.052 0.013zm0.096 0.072c0.049 0 0.087-0.011 0.114-0.033s0.04-0.052 0.04-0.09c0-0.032-0.01-0.058-0.032-0.079-0.021-0.02-0.051-0.033-0.091-0.038l0.126-0.145h-0.098l-0.117 0.144h-0.038v-0.144h-0.082v0.385zm-0.025-0.518c0.045 0 0.087 9e-3 0.125 0.026 0.039 0.017 0.073 0.04 0.102 0.069s0.052 0.063 0.069 0.103c0.016 0.039 0.025 0.081 0.025 0.126s-9e-3 0.087-0.025 0.126c-0.017 0.039-0.04 0.074-0.069 0.103s-0.063 0.052-0.102 0.069c-0.038 0.016-0.08 0.024-0.125 0.024s-0.088-8e-3 -0.127-0.024c-0.04-0.017-0.075-0.04-0.104-0.069s-0.052-0.064-0.068-0.103c-0.017-0.039-0.025-0.081-0.025-0.126s8e-3 -0.087 0.025-0.126c0.016-0.04 0.039-0.074 0.068-0.103s0.064-0.052 0.104-0.069c0.039-0.017 0.082-0.026 0.127-0.026m0 0.739c0.059 0 0.113-0.011 0.165-0.033 0.051-0.021 0.095-0.051 0.134-0.089 0.038-0.037 0.068-0.081 0.09-0.132 0.022-0.05 0.033-0.104 0.033-0.161s-0.011-0.111-0.033-0.161-0.052-0.094-0.09-0.132c-0.039-0.037-0.083-0.067-0.134-0.089-0.052-0.022-0.106-0.033-0.165-0.033-0.06 0-0.115 0.011-0.167 0.033s-0.097 0.052-0.135 0.089c-0.038 0.038-0.068 0.082-0.09 0.132s-0.033 0.104-0.033 0.161 0.011 0.111 0.033 0.161c0.022 0.051 0.052 0.095 0.09 0.132 0.038 0.038 0.083 0.068 0.135 0.089 0.052 0.022 0.107 0.033 0.167 0.033m-38.961 1.483c0 0.734 0.481 1.337 1.267 1.337 0.751 0 1.258-0.577 1.258-1.337s-0.507-1.337-1.258-1.337c-0.786 0-1.267 0.603-1.267 1.337m3.381 0v2.088h-0.908v-0.507c-0.288 0.376-0.725 0.612-1.319 0.612-1.171 0-2.089-0.918-2.089-2.193 0-1.276 0.918-2.193 2.089-2.193 0.594 0 1.031 0.236 1.319 0.612v-0.507h0.908zm30.684 0c0 0.734 0.481 1.337 1.267 1.337 0.752 0 1.258-0.577 1.258-1.337s-0.506-1.337-1.258-1.337c-0.786 0-1.267 0.603-1.267 1.337m3.382 0v3.765h-0.909v-2.184c-0.288 0.376-0.725 0.612-1.319 0.612-1.171 0-2.089-0.918-2.089-2.193 0-1.276 0.918-2.193 2.089-2.193 0.594 0 1.031 0.236 1.319 0.612v-0.507h0.909zm-22.795 1.38c0.585 0 0.961-0.367 1.057-1.013h-2.167c0.097 0.603 0.463 1.013 1.11 1.013m0.018 0.813c-1.224 0-2.08-0.891-2.08-2.193 0-1.328 0.891-2.193 2.141-2.193 0.629 0 1.205 0.157 1.712 0.585l-0.445 0.673c-0.35-0.279-0.796-0.437-1.215-0.437-0.585 0-1.118 0.271-1.249 1.023h3.101c9e-3 0.113 0.018 0.227 0.018 0.349-9e-3 1.302-0.813 2.193-1.983 2.193m10.964-2.193c0 0.734 0.481 1.337 1.267 1.337 0.751 0 1.258-0.577 1.258-1.337s-0.507-1.337-1.258-1.337c-0.786 0-1.267 0.603-1.267 1.337m3.381 0v2.088h-0.908v-0.507c-0.289 0.376-0.725 0.612-1.319 0.612-1.171 0-2.089-0.918-2.089-2.193 0-1.276 0.918-2.193 2.089-2.193 0.594 0 1.03 0.236 1.319 0.612v-0.507h0.908zm-8.509 0c0-1.267 0.882-2.193 2.228-2.193 0.629 0 1.048 0.14 1.502 0.498l-0.436 0.734c-0.341-0.245-0.699-0.376-1.093-0.376-0.725 9e-3 -1.258 0.533-1.258 1.337s0.533 1.328 1.258 1.337c0.394 0 0.752-0.131 1.093-0.376l0.436 0.734c-0.454 0.358-0.873 0.498-1.502 0.498-1.346 0-2.228-0.926-2.228-2.193m11.707 2.193c-0.524 0-0.865-0.245-1.101-0.612v0.507h-0.9v-4.176h0.909v2.341c0 0.691 0.297 1.075 0.891 1.075 0.184 0 0.376-0.026 0.568-0.105l0.28 0.856c-0.201 0.079-0.463 0.114-0.647 0.114m-24.341-0.437c-0.437 0.288-1.039 0.437-1.703 0.437-1.058 0-1.739-0.507-1.739-1.337 0-0.681 0.507-1.101 1.441-1.232l0.429-0.061c0.498-0.07 0.733-0.201 0.733-0.437 0-0.323-0.332-0.507-0.952-0.507-0.629 0-1.083 0.201-1.389 0.437l-0.428-0.707c0.498-0.367 1.127-0.542 1.808-0.542 1.206 0 1.905 0.568 1.905 1.363 0 0.734-0.55 1.118-1.459 1.249l-0.428 0.062c-0.393 0.052-0.708 0.13-0.708 0.41 0 0.306 0.297 0.489 0.795 0.489 0.533 0 1.049-0.201 1.302-0.358zm11.716 0.437c-0.524 0-0.865-0.245-1.1-0.612v0.507h-0.9v-4.176h0.908v2.341c0 0.691 0.297 1.075 0.891 1.075 0.184 0 0.376-0.026 0.568-0.105l0.28 0.856c-0.201 0.079-0.463 0.114-0.647 0.114m-7.749-0.105h-1.485v1.267h-0.918v-1.267h-0.847v-0.83h0.847v-1.905c0-0.969 0.376-1.546 1.45-1.546 0.394 0 0.848 0.122 1.136 0.323l-0.262 0.778c-0.271-0.157-0.568-0.236-0.804-0.236-0.454 0-0.602 0.28-0.602 0.699v1.887h1.485zm-13.577-4.176v2.621c0 0.987-0.629 1.651-1.643 1.66-0.533 9e-3 -1.083-0.157-1.468-0.743-0.288 0.463-0.742 0.743-1.38 0.743-0.446 0-0.882-0.131-1.223-0.62v0.515h-0.909v-4.176h0.917v2.315c0 0.725 0.402 1.11 1.023 1.11 0.603 0 0.908-0.393 0.908-1.101v-2.324h0.918v2.315c0 0.725 0.419 1.11 1.022 1.11 0.62 0 0.917-0.393 0.917-1.101v-2.324z" fill="#231f20"/>
   </g>
   <g transform="matrix(1.25 0 0 -1.25 1103.2 710.77)">
    <path d="m0 0v0.61h-0.159l-0.184-0.419-0.183 0.419h-0.16v-0.61h0.113v0.46l0.172-0.397h0.117l0.172 0.398v-0.461zm-1.009 0v0.506h0.204v0.103h-0.52v-0.103h0.204v-0.506z" fill="#f79410"/>
   </g>
   <path d="m1080.6 714.05h-17.202v-30.915h17.202z" fill="#ff5f00"/>
   <g transform="matrix(1.25 0 0 -1.25 1064.5 698.59)">
    <path d="m0 0c0 5.017 2.349 9.486 6.007 12.366-2.675 2.106-6.051 3.363-9.72 3.363-8.686 0-15.727-7.042-15.727-15.729s7.041-15.729 15.727-15.729c3.669 0 7.045 1.257 9.72 3.363-3.658 2.88-6.007 7.349-6.007 12.366" fill="#eb001b"/>
   </g>
   <g transform="matrix(1.25 0 0 -1.25 1103.8 698.59)">
    <path d="m0 0c0-8.687-7.041-15.729-15.727-15.729-3.669 0-7.045 1.257-9.721 3.363 3.659 2.88 6.008 7.349 6.008 12.366s-2.349 9.486-6.008 12.366c2.676 2.106 6.052 3.363 9.721 3.363 8.686 0 15.727-7.042 15.727-15.729" fill="#f79e1b"/>
   </g>
  </g>
 </g>
</svg>
`;

myActorImgs['consumer'] = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
  width="80" height="80" viewbox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
<style type="text/css">
	.st0{display:none;}
	.st1{display:inline;}
	.st2{fill:#FFFFFF;}
	.st3{display:inline;fill:#B8B8B8;}
	.st4{display:inline;fill:#727271;}
	.st5{fill:#B8B8B8;}
	.st6{fill:#727271;}
	.st7{fill:#141413;}
</style>
<g id="White" class="st0">
	<g class="st1">
		<rect x="27.9" y="39.7" class="st2" width="1.6" height="18.9"/>
		<rect x="34.5" y="39.7" class="st2" width="1.6" height="18.9"/>
		<path class="st2" d="M32,17.7c2.8,0,5.1-2.3,5.1-5.1c0-2.8-2.3-5.1-5.1-5.1s-5.1,2.3-5.1,5.1C26.9,15.4,29.2,17.7,32,17.7z M32,9
			c2,0,3.5,1.6,3.5,3.5c0,2-1.6,3.5-3.5,3.5c-2,0-3.5-1.6-3.5-3.5C28.5,10.6,30,9,32,9z"/>
		<path class="st2" d="M39.6,20.8c-0.6-1.1-1.3-1.5-2-1.3c-0.7,0.2-1,0.9-1,2.1v2.7v2.3v9.9h-0.4h-1.6h-5.1h-1.6h-0.4v-9.9v-2.3
			v-2.7c0-1.2-0.3-1.9-1-2.1c-0.7-0.2-1.4,0.2-2,1.3L18,31.6l1.4,0.8l6.5-10.8c0,0,0-0.1,0.1-0.1c0,0,0,0.1,0,0.1v2.7v2.3v11.5h2
			h1.6h5.1h1.6h2V26.7v-2.3v-2.7c0,0,0-0.1,0-0.1c0,0,0,0.1,0.1,0.1l6.5,10.8l1.4-0.8L39.6,20.8z"/>
	</g>
</g>
<g id="Green" class="st0">
	<rect x="27.9" y="39.7" class="st3" width="1.6" height="18.9"/>
	<rect x="34.5" y="39.7" class="st3" width="1.6" height="18.9"/>
	<path class="st3" d="M32,17.7c2.8,0,5.1-2.3,5.1-5.1c0-2.8-2.3-5.1-5.1-5.1s-5.1,2.3-5.1,5.1C26.9,15.4,29.2,17.7,32,17.7z M32,9
		c2,0,3.5,1.6,3.5,3.5c0,2-1.6,3.5-3.5,3.5c-2,0-3.5-1.6-3.5-3.5C28.5,10.6,30,9,32,9z"/>
	<path class="st4" d="M39.6,20.8c-0.6-1.1-1.3-1.5-2-1.3c-0.7,0.2-1,0.9-1,2.1v2.7v2.3v9.9h-0.4h-1.6h-5.1h-1.6h-0.4v-9.9v-2.3v-2.7
		c0-1.2-0.3-1.9-1-2.1c-0.7-0.2-1.4,0.2-2,1.3L18,31.6l1.4,0.8l6.5-10.8c0,0,0-0.1,0.1-0.1c0,0,0,0.1,0,0.1v2.7v2.3v11.5h2h1.6h5.1
		h1.6h2V26.7v-2.3v-2.7c0,0,0-0.1,0-0.1c0,0,0,0.1,0.1,0.1l6.5,10.8l1.4-0.8L39.6,20.8z"/>
</g>
<g id="Orange">
	<rect x="27.9" y="39.7" class="st5" width="1.6" height="18.9"/>
	<rect x="34.5" y="39.7" class="st5" width="1.6" height="18.9"/>
	<path class="st5" d="M32,17.7c2.8,0,5.1-2.3,5.1-5.1c0-2.8-2.3-5.1-5.1-5.1s-5.1,2.3-5.1,5.1C26.9,15.4,29.2,17.7,32,17.7z M32,9
		c2,0,3.5,1.6,3.5,3.5c0,2-1.6,3.5-3.5,3.5c-2,0-3.5-1.6-3.5-3.5C28.5,10.6,30,9,32,9z"/>
	<path class="st6" d="M39.6,20.8c-0.6-1.1-1.3-1.5-2-1.3c-0.7,0.2-1,0.9-1,2.1v2.7v2.3v9.9h-0.4h-1.6h-5.1h-1.6h-0.4v-9.9v-2.3v-2.7
		c0-1.2-0.3-1.9-1-2.1c-0.7-0.2-1.4,0.2-2,1.3L18,31.6l1.4,0.8l6.5-10.8c0,0,0-0.1,0.1-0.1c0,0,0,0.1,0,0.1v2.7v2.3v11.5h2h1.6h5.1
		h1.6h2V26.7v-2.3v-2.7c0,0,0-0.1,0-0.1c0,0,0,0.1,0.1,0.1l6.5,10.8l1.4-0.8L39.6,20.8z"/>
</g>
<g id="Black" class="st0">
	<g class="st1">
		<rect x="27.9" y="39.7" class="st7" width="1.6" height="18.9"/>
		<rect x="34.5" y="39.7" class="st7" width="1.6" height="18.9"/>
		<path class="st7" d="M32,17.7c2.8,0,5.1-2.3,5.1-5.1c0-2.8-2.3-5.1-5.1-5.1s-5.1,2.3-5.1,5.1C26.9,15.4,29.2,17.7,32,17.7z M32,9
			c2,0,3.5,1.6,3.5,3.5c0,2-1.6,3.5-3.5,3.5c-2,0-3.5-1.6-3.5-3.5C28.5,10.6,30,9,32,9z"/>
		<path class="st7" d="M39.6,20.8c-0.6-1.1-1.3-1.5-2-1.3c-0.7,0.2-1,0.9-1,2.1v2.7v2.3v9.9h-0.4h-1.6h-5.1h-1.6h-0.4v-9.9v-2.3
			v-2.7c0-1.2-0.3-1.9-1-2.1c-0.7-0.2-1.4,0.2-2,1.3L18,31.6l1.4,0.8l6.5-10.8c0,0,0-0.1,0.1-0.1c0,0,0,0.1,0,0.1v2.7v2.3v11.5h2
			h1.6h5.1h1.6h2V26.7v-2.3v-2.7c0,0,0-0.1,0-0.1c0,0,0,0.1,0.1,0.1l6.5,10.8l1.4-0.8L39.6,20.8z"/>
	</g>
</g>
</svg>
`;

myActorImgs['smartphone'] = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
  width="80" height="80" viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
<style type="text/css">
	.st0{display:none;}
	.st1{display:inline;}
	.st2{fill:#FFFFFF;}
	.st3{fill:#727271;}
	.st4{fill:#FFB38D;}
	.st5{fill:#FF671B;}
	.st6{display:inline;fill:#727271;}
	.st7{display:inline;fill:#C6DC96;}
	.st8{display:inline;fill:#8DB92E;}
	.st9{fill:#141413;}
</style>
<g id="White" class="st0">
	<g class="st1">
		<path class="st2" d="M46.1,41.8V11c0-2.1-1.7-3.8-3.8-3.8H32H21.7c-2.1,0-3.8,1.7-3.8,3.8v34.7V48v5c0,2.1,1.7,3.8,3.8,3.8h20.7
			c2.1,0,3.8-1.7,3.8-3.8v-7.3c0-0.1,0-0.2,0-0.3c-0.1-1.1-0.7-2.1-1.6-2.8c-0.6-0.4-1.4-0.7-2.2-0.7H19.5v-1.6V11
			c0-1.2,1-2.2,2.2-2.2H32h10.3c1.2,0,2.2,1,2.2,2.2v29.7C45.1,41,45.7,41.4,46.1,41.8z M42.3,43.5c1.2,0,2.2,1,2.2,2.2V53
			c0,1.2-1,2.2-2.2,2.2H21.7c-1.2,0-2.2-1-2.2-2.2v-5v-2.3v-0.6v-1.6H42.3z"/>
		<rect x="29" y="12.5" class="st2" width="6" height="1.6"/>
		<path class="st2" d="M31.3,53.1h1.3c1.5,0,2.8-1.3,2.8-2.8V49c0-1.5-1.3-2.8-2.8-2.8h-1.3c-1.5,0-2.8,1.3-2.8,2.8v1.3
			C28.5,51.9,29.8,53.1,31.3,53.1z M30.1,49c0-0.7,0.5-1.2,1.2-1.2h1.3c0.7,0,1.2,0.5,1.2,1.2v1.3c0,0.7-0.5,1.2-1.2,1.2h-1.3
			c-0.7,0-1.2-0.5-1.2-1.2V49z"/>
	</g>
</g>
<g id="Orange">
	<path class="st3" d="M46.1,41.8V11c0-2.1-1.7-3.8-3.8-3.8H32H21.7c-2.1,0-3.8,1.7-3.8,3.8v34.7V48v5c0,2.1,1.7,3.8,3.8,3.8h20.7
		c2.1,0,3.8-1.7,3.8-3.8v-7.3c0-0.1,0-0.2,0-0.3c-0.1-1.1-0.7-2.1-1.6-2.8c-0.6-0.4-1.4-0.7-2.2-0.7H19.5v-1.6V11
		c0-1.2,1-2.2,2.2-2.2H32h10.3c1.2,0,2.2,1,2.2,2.2v29.7C45.1,41,45.7,41.4,46.1,41.8z M42.3,43.5c1.2,0,2.2,1,2.2,2.2V53
		c0,1.2-1,2.2-2.2,2.2H21.7c-1.2,0-2.2-1-2.2-2.2v-5v-2.3v-0.6v-1.6H42.3z"/>
	<rect x="29" y="12.5" class="st4" width="6" height="1.6"/>
	<path class="st5" d="M31.3,53.1h1.3c1.5,0,2.8-1.3,2.8-2.8V49c0-1.5-1.3-2.8-2.8-2.8h-1.3c-1.5,0-2.8,1.3-2.8,2.8v1.3
		C28.5,51.9,29.8,53.1,31.3,53.1z M30.1,49c0-0.7,0.5-1.2,1.2-1.2h1.3c0.7,0,1.2,0.5,1.2,1.2v1.3c0,0.7-0.5,1.2-1.2,1.2h-1.3
		c-0.7,0-1.2-0.5-1.2-1.2V49z"/>
</g>
<g id="Green" class="st0">
	<path class="st6" d="M46.1,41.8V11c0-2.1-1.7-3.8-3.8-3.8H32H21.7c-2.1,0-3.8,1.7-3.8,3.8v34.7V48v5c0,2.1,1.7,3.8,3.8,3.8h20.7
		c2.1,0,3.8-1.7,3.8-3.8v-7.3c0-0.1,0-0.2,0-0.3c-0.1-1.1-0.7-2.1-1.6-2.8c-0.6-0.4-1.4-0.7-2.2-0.7H19.5v-1.6V11
		c0-1.2,1-2.2,2.2-2.2H32h10.3c1.2,0,2.2,1,2.2,2.2v29.7C45.1,41,45.7,41.4,46.1,41.8z M42.3,43.5c1.2,0,2.2,1,2.2,2.2V53
		c0,1.2-1,2.2-2.2,2.2H21.7c-1.2,0-2.2-1-2.2-2.2v-5v-2.3v-0.6v-1.6H42.3z"/>
	<rect x="29" y="12.5" class="st7" width="6" height="1.6"/>
	<path class="st8" d="M31.3,53.1h1.3c1.5,0,2.8-1.3,2.8-2.8V49c0-1.5-1.3-2.8-2.8-2.8h-1.3c-1.5,0-2.8,1.3-2.8,2.8v1.3
		C28.5,51.9,29.8,53.1,31.3,53.1z M30.1,49c0-0.7,0.5-1.2,1.2-1.2h1.3c0.7,0,1.2,0.5,1.2,1.2v1.3c0,0.7-0.5,1.2-1.2,1.2h-1.3
		c-0.7,0-1.2-0.5-1.2-1.2V49z"/>
</g>
<g id="Black" class="st0">
	<g class="st1">
		<path class="st9" d="M46.1,41.8V11c0-2.1-1.7-3.8-3.8-3.8H32H21.7c-2.1,0-3.8,1.7-3.8,3.8v34.7V48v5c0,2.1,1.7,3.8,3.8,3.8h20.7
			c2.1,0,3.8-1.7,3.8-3.8v-7.3c0-0.1,0-0.2,0-0.3c-0.1-1.1-0.7-2.1-1.6-2.8c-0.6-0.4-1.4-0.7-2.2-0.7H19.5v-1.6V11
			c0-1.2,1-2.2,2.2-2.2H32h10.3c1.2,0,2.2,1,2.2,2.2v29.7C45.1,41,45.7,41.4,46.1,41.8z M42.3,43.5c1.2,0,2.2,1,2.2,2.2V53
			c0,1.2-1,2.2-2.2,2.2H21.7c-1.2,0-2.2-1-2.2-2.2v-5v-2.3v-0.6v-1.6H42.3z"/>
		<rect x="29" y="12.5" class="st9" width="6" height="1.6"/>
		<path class="st9" d="M31.3,53.1h1.3c1.5,0,2.8-1.3,2.8-2.8V49c0-1.5-1.3-2.8-2.8-2.8h-1.3c-1.5,0-2.8,1.3-2.8,2.8v1.3
			C28.5,51.9,29.8,53.1,31.3,53.1z M30.1,49c0-0.7,0.5-1.2,1.2-1.2h1.3c0.7,0,1.2,0.5,1.2,1.2v1.3c0,0.7-0.5,1.2-1.2,1.2h-1.3
			c-0.7,0-1.2-0.5-1.2-1.2V49z"/>
	</g>
</g>
</svg>
`;

myActorImgs['server'] = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	width="80" height="80" viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
<style type="text/css">
	.st0{display:none;}
	.st1{display:inline;fill:#C3C0B9;}
	.st2{display:inline;fill:#74726E;}
	.st3{display:inline;fill:#8DB92E;}
	.st4{display:inline;fill:#C6DC97;}
	.st5{fill:#C3C0B9;}
	.st6{fill:#74726E;}
	.st7{fill:#FF671B;}
	.st8{fill:#FFA476;}
	.st9{display:inline;}
	.st10{fill:#FFFFFF;}
</style>
<g id="Green" class="st0">
	<rect x="18.4" y="41.9" class="st1" width="27.2" height="1.6"/>
	<rect x="18.4" y="25.9" class="st1" width="27.2" height="1.6"/>
	<path class="st2" d="M45,9.9H19c-2.1,0-3.8,1.7-3.8,3.8v43.1h33.6V13.7C48.8,11.6,47.1,9.9,45,9.9z M47.2,55.2H16.8V43.5v-1.6V27.5
		v-1.6V13.7c0-1.2,1-2.2,2.2-2.2h26c1.2,0,2.2,1,2.2,2.2v12.2v1.6v14.4v1.6V55.2z"/>
	<path class="st3" d="M24,22.1c1.9,0,3.5-1.6,3.5-3.5c0-1.9-1.6-3.5-3.5-3.5s-3.5,1.6-3.5,3.5C20.5,20.6,22.1,22.1,24,22.1z
		 M24,16.8c1,0,1.9,0.8,1.9,1.9c0,1-0.8,1.9-1.9,1.9c-1,0-1.9-0.8-1.9-1.9C22.1,17.6,23,16.8,24,16.8z"/>
	<rect x="34.7" y="17.9" class="st4" width="8" height="1.6"/>
	<path class="st3" d="M27.5,34.7c0-1.9-1.6-3.5-3.5-3.5s-3.5,1.6-3.5,3.5c0,1.9,1.6,3.5,3.5,3.5S27.5,36.6,27.5,34.7z M22.1,34.7
		c0-1,0.8-1.9,1.9-1.9c1,0,1.9,0.8,1.9,1.9S25,36.5,24,36.5C23,36.5,22.1,35.7,22.1,34.7z"/>
	<rect x="34.7" y="33.9" class="st4" width="8" height="1.6"/>
	<path class="st3" d="M24,46.5c-1.9,0-3.5,1.6-3.5,3.5c0,1.9,1.6,3.5,3.5,3.5s3.5-1.6,3.5-3.5C27.5,48.1,25.9,46.5,24,46.5z
		 M24,51.9c-1,0-1.9-0.8-1.9-1.9s0.8-1.9,1.9-1.9c1,0,1.9,0.8,1.9,1.9S25,51.9,24,51.9z"/>
	<rect x="34.7" y="49.2" class="st4" width="8" height="1.6"/>
</g>
<g id="Orange">
	<rect x="18.4" y="41.9" class="st5" width="27.2" height="1.6"/>
	<rect x="18.4" y="25.9" class="st5" width="27.2" height="1.6"/>
	<path class="st6" d="M45,9.9H19c-2.1,0-3.8,1.7-3.8,3.8v43.1h33.6V13.7C48.8,11.6,47.1,9.9,45,9.9z M47.2,55.2H16.8V43.5v-1.6V27.5
		v-1.6V13.7c0-1.2,1-2.2,2.2-2.2h26c1.2,0,2.2,1,2.2,2.2v12.2v1.6v14.4v1.6V55.2z"/>
	<path class="st7" d="M24,22.1c1.9,0,3.5-1.6,3.5-3.5c0-1.9-1.6-3.5-3.5-3.5s-3.5,1.6-3.5,3.5C20.5,20.6,22.1,22.1,24,22.1z
		 M24,16.8c1,0,1.9,0.8,1.9,1.9c0,1-0.8,1.9-1.9,1.9c-1,0-1.9-0.8-1.9-1.9C22.1,17.6,23,16.8,24,16.8z"/>
	<rect x="34.7" y="17.9" class="st8" width="8" height="1.6"/>
	<path class="st7" d="M27.5,34.7c0-1.9-1.6-3.5-3.5-3.5s-3.5,1.6-3.5,3.5c0,1.9,1.6,3.5,3.5,3.5S27.5,36.6,27.5,34.7z M22.1,34.7
		c0-1,0.8-1.9,1.9-1.9c1,0,1.9,0.8,1.9,1.9S25,36.5,24,36.5C23,36.5,22.1,35.7,22.1,34.7z"/>
	<rect x="34.7" y="33.9" class="st8" width="8" height="1.6"/>
	<path class="st7" d="M24,46.5c-1.9,0-3.5,1.6-3.5,3.5c0,1.9,1.6,3.5,3.5,3.5s3.5-1.6,3.5-3.5C27.5,48.1,25.9,46.5,24,46.5z
		 M24,51.9c-1,0-1.9-0.8-1.9-1.9s0.8-1.9,1.9-1.9c1,0,1.9,0.8,1.9,1.9S25,51.9,24,51.9z"/>
	<rect x="34.7" y="49.2" class="st8" width="8" height="1.6"/>
</g>
<g id="White" class="st0">
	<g class="st9">
		<rect x="18.4" y="41.9" class="st10" width="27.2" height="1.6"/>
		<rect x="18.4" y="25.9" class="st10" width="27.2" height="1.6"/>
		<path class="st10" d="M45,9.9H19c-2.1,0-3.8,1.7-3.8,3.8v43.1h33.6V13.7C48.8,11.6,47.1,9.9,45,9.9z M47.2,55.2H16.8V43.5v-1.6
			V27.5v-1.6V13.7c0-1.2,1-2.2,2.2-2.2h26c1.2,0,2.2,1,2.2,2.2v12.2v1.6v14.4v1.6V55.2z"/>
		<path class="st10" d="M24,22.1c1.9,0,3.5-1.6,3.5-3.5c0-1.9-1.6-3.5-3.5-3.5s-3.5,1.6-3.5,3.5C20.5,20.6,22.1,22.1,24,22.1z
			 M24,16.8c1,0,1.9,0.8,1.9,1.9c0,1-0.8,1.9-1.9,1.9c-1,0-1.9-0.8-1.9-1.9C22.1,17.6,23,16.8,24,16.8z"/>
		<rect x="34.7" y="17.9" class="st10" width="8" height="1.6"/>
		<path class="st10" d="M27.5,34.7c0-1.9-1.6-3.5-3.5-3.5s-3.5,1.6-3.5,3.5c0,1.9,1.6,3.5,3.5,3.5S27.5,36.6,27.5,34.7z M22.1,34.7
			c0-1,0.8-1.9,1.9-1.9c1,0,1.9,0.8,1.9,1.9S25,36.5,24,36.5C23,36.5,22.1,35.7,22.1,34.7z"/>
		<rect x="34.7" y="33.9" class="st10" width="8" height="1.6"/>
		<path class="st10" d="M24,46.5c-1.9,0-3.5,1.6-3.5,3.5c0,1.9,1.6,3.5,3.5,3.5s3.5-1.6,3.5-3.5C27.5,48.1,25.9,46.5,24,46.5z
			 M24,51.9c-1,0-1.9-0.8-1.9-1.9s0.8-1.9,1.9-1.9c1,0,1.9,0.8,1.9,1.9S25,51.9,24,51.9z"/>
		<rect x="34.7" y="49.2" class="st10" width="8" height="1.6"/>
	</g>
</g>
<g id="Black" class="st0">
	<g class="st9">
		<rect x="18.4" y="41.9" width="27.2" height="1.6"/>
		<rect x="18.4" y="25.9" width="27.2" height="1.6"/>
		<path d="M45,9.9H19c-2.1,0-3.8,1.7-3.8,3.8v43.1h33.6V13.7C48.8,11.6,47.1,9.9,45,9.9z M47.2,55.2H16.8V43.5v-1.6V27.5v-1.6V13.7
			c0-1.2,1-2.2,2.2-2.2h26c1.2,0,2.2,1,2.2,2.2v12.2v1.6v14.4v1.6V55.2z"/>
		<path d="M24,22.1c1.9,0,3.5-1.6,3.5-3.5c0-1.9-1.6-3.5-3.5-3.5s-3.5,1.6-3.5,3.5C20.5,20.6,22.1,22.1,24,22.1z M24,16.8
			c1,0,1.9,0.8,1.9,1.9c0,1-0.8,1.9-1.9,1.9c-1,0-1.9-0.8-1.9-1.9C22.1,17.6,23,16.8,24,16.8z"/>
		<rect x="34.7" y="17.9" width="8" height="1.6"/>
		<path d="M27.5,34.7c0-1.9-1.6-3.5-3.5-3.5s-3.5,1.6-3.5,3.5c0,1.9,1.6,3.5,3.5,3.5S27.5,36.6,27.5,34.7z M22.1,34.7
			c0-1,0.8-1.9,1.9-1.9c1,0,1.9,0.8,1.9,1.9S25,36.5,24,36.5C23,36.5,22.1,35.7,22.1,34.7z"/>
		<rect x="34.7" y="33.9" width="8" height="1.6"/>
		<path d="M24,46.5c-1.9,0-3.5,1.6-3.5,3.5c0,1.9,1.6,3.5,3.5,3.5s3.5-1.6,3.5-3.5C27.5,48.1,25.9,46.5,24,46.5z M24,51.9
			c-1,0-1.9-0.8-1.9-1.9s0.8-1.9,1.9-1.9c1,0,1.9,0.8,1.9,1.9S25,51.9,24,51.9z"/>
		<rect x="34.7" y="49.2" width="8" height="1.6"/>
	</g>
</g>
</svg>`;

myActorImgs['merchant'] = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
  width="80" height="80" viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
<style type="text/css">
	.st0{display:none;}
	.st1{display:inline;}
	.st2{fill:#FFFFFF;}
	.st3{fill:#FF671B;}
	.st4{fill:#727271;}
	.st5{fill:#B8B8B8;}
	.st6{display:inline;fill:#8DB92E;}
	.st7{display:inline;fill:#727271;}
	.st8{display:inline;fill:#B8B8B8;}
	.st9{fill:#141413;}
</style>
<g id="White" class="st0">
	<g class="st1">
		<path class="st2" d="M16,34.3c-0.5,0.4-1,0.7-1.5,0.9v12.9h23.7V35.4c-0.5,0.2-1,0.3-1.6,0.3v10.9H16.1L16,34.3
			C16,34.4,16,34.3,16,34.3z"/>
		<path class="st2" d="M53.3,54.6h-1.8V41.7c0-2.1-1.7-3.8-3.8-3.8h-2.8c-2.1,0-3.8,1.7-3.8,3.8v12.9H11.5V35.7
			c-0.6,0-1.1-0.2-1.6-0.3v20.8h32.8V41.7c0-1.2,1-2.2,2.2-2.2h2.8c1.2,0,2.2,1,2.2,2.2v14.5h5V35c-0.5,0.3-1,0.4-1.6,0.6V54.6z"/>
		<path class="st2" d="M56.8,29.5l0-0.2L53.3,9.9H10.7L7.2,29.2l0,0.1l0,0.1l0,0.2h0c0.1,1.8,1.1,3.3,2.6,4c0.5,0.2,1,0.4,1.6,0.5
			c0.2,0,0.4,0.1,0.5,0.1c0.9,0,1.7-0.3,2.5-0.7c0.1,0,0.1-0.1,0.2-0.1c0.5-0.4,1-0.8,1.4-1.3c0.9,1.3,2.3,2.1,4,2.1
			c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1c0.2,0,0.4,0,0.5,0
			c0.6-0.1,1.1-0.2,1.6-0.5c0.8-0.4,1.4-0.9,1.9-1.6c0.9,1.3,2.3,2.1,4,2.1c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1
			c0.4,0,0.9-0.1,1.3-0.2c0.5-0.1,0.9-0.3,1.4-0.6C55.9,32.5,56.7,31.2,56.8,29.5L56.8,29.5L56.8,29.5z M12,32.5
			c-1.7,0-3-1.3-3.2-2.9h0l0-0.1l0-0.2L12,11.5h5.7l-0.2,1.6l-2.3,16.2l0,0.1h0C15.2,31.1,13.8,32.5,12,32.5z M23.2,29.3
			c0,1.8-1.4,3.2-3.2,3.2c-1.8,0-3.2-1.4-3.2-3.2l0,0l2.3-16.3l0.2-1.6h5.4l-0.1,1.6L23.2,29.3z M28,32.5c-1.8,0-3.2-1.4-3.2-3.2
			l0,0l1.5-16.3l0.1-1.6h4.8v1.6v16.3C31.2,31.1,29.8,32.5,28,32.5z M36,32.5c-1.8,0-3.2-1.4-3.2-3.2V13.1v-1.6h4.8l0.1,1.6
			l1.5,16.3h0C39.2,31.1,37.8,32.5,36,32.5z M47.2,29.3c0,1.8-1.4,3.2-3.2,3.2c-1.7,0-3.1-1.3-3.2-3l0-0.2l0-0.1l-1.4-16.2l-0.1-1.6
			h5.4l0.2,1.6L47.2,29.3L47.2,29.3z M55.2,29.6c-0.1,1.6-1.5,2.9-3.2,2.9c-1.7,0-3-1.3-3.2-2.9v-0.3l-2.3-16.3l-0.2-1.6H52
			l3.2,17.9l0,0l0,0L55.2,29.6L55.2,29.6z"/>
	</g>
</g>
<g id="Orange">
	<path class="st3" d="M16,34.3c-0.5,0.4-1,0.7-1.5,0.9v12.9h23.7V35.4c-0.5,0.2-1,0.3-1.6,0.3v10.9H16.1L16,34.3
		C16,34.4,16,34.3,16,34.3z"/>
	<path class="st4" d="M53.3,54.6h-1.8V41.7c0-2.1-1.7-3.8-3.8-3.8h-2.8c-2.1,0-3.8,1.7-3.8,3.8v12.9H11.5V35.7
		c-0.6,0-1.1-0.2-1.6-0.3v20.8h32.8V41.7c0-1.2,1-2.2,2.2-2.2h2.8c1.2,0,2.2,1,2.2,2.2v14.5h5V35c-0.5,0.3-1,0.4-1.6,0.6V54.6z"/>
	<path class="st5" d="M56.8,29.5l0-0.2L53.3,9.9H10.7L7.2,29.2l0,0.1l0,0.1l0,0.2h0c0.1,1.8,1.1,3.3,2.6,4c0.5,0.2,1,0.4,1.6,0.5
		c0.2,0,0.4,0.1,0.5,0.1c0.9,0,1.7-0.3,2.5-0.7c0.1,0,0.1-0.1,0.2-0.1c0.5-0.4,1-0.8,1.4-1.3c0.9,1.3,2.3,2.1,4,2.1
		c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1c0.2,0,0.4,0,0.5,0c0.6-0.1,1.1-0.2,1.6-0.5
		c0.8-0.4,1.4-0.9,1.9-1.6c0.9,1.3,2.3,2.1,4,2.1c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1c0.4,0,0.9-0.1,1.3-0.2
		c0.5-0.1,0.9-0.3,1.4-0.6C55.9,32.5,56.7,31.2,56.8,29.5L56.8,29.5L56.8,29.5z M12,32.5c-1.7,0-3-1.3-3.2-2.9h0l0-0.1l0-0.2
		L12,11.5h5.7l-0.2,1.6l-2.3,16.2l0,0.1h0C15.2,31.1,13.8,32.5,12,32.5z M23.2,29.3c0,1.8-1.4,3.2-3.2,3.2c-1.8,0-3.2-1.4-3.2-3.2
		l0,0l2.3-16.3l0.2-1.6h5.4l-0.1,1.6L23.2,29.3z M28,32.5c-1.8,0-3.2-1.4-3.2-3.2l0,0l1.5-16.3l0.1-1.6h4.8v1.6v16.3
		C31.2,31.1,29.8,32.5,28,32.5z M36,32.5c-1.8,0-3.2-1.4-3.2-3.2V13.1v-1.6h4.8l0.1,1.6l1.5,16.3h0C39.2,31.1,37.8,32.5,36,32.5z
		 M47.2,29.3c0,1.8-1.4,3.2-3.2,3.2c-1.7,0-3.1-1.3-3.2-3l0-0.2l0-0.1l-1.4-16.2l-0.1-1.6h5.4l0.2,1.6L47.2,29.3L47.2,29.3z
		 M55.2,29.6c-0.1,1.6-1.5,2.9-3.2,2.9c-1.7,0-3-1.3-3.2-2.9v-0.3l-2.3-16.3l-0.2-1.6H52l3.2,17.9l0,0l0,0L55.2,29.6L55.2,29.6z"/>
</g>
<g id="Green" class="st0">
	<path class="st6" d="M16,34.3c-0.5,0.4-1,0.7-1.5,0.9v12.9h23.7V35.4c-0.5,0.2-1,0.3-1.6,0.3v10.9H16.1L16,34.3
		C16,34.4,16,34.3,16,34.3z"/>
	<path class="st7" d="M53.3,54.6h-1.8V41.7c0-2.1-1.7-3.8-3.8-3.8h-2.8c-2.1,0-3.8,1.7-3.8,3.8v12.9H11.5V35.7
		c-0.6,0-1.1-0.2-1.6-0.3v20.8h32.8V41.7c0-1.2,1-2.2,2.2-2.2h2.8c1.2,0,2.2,1,2.2,2.2v14.5h5V35c-0.5,0.3-1,0.4-1.6,0.6V54.6z"/>
	<path class="st8" d="M56.8,29.5l0-0.2L53.3,9.9H10.7L7.2,29.2l0,0.1l0,0.1l0,0.2h0c0.1,1.8,1.1,3.3,2.6,4c0.5,0.2,1,0.4,1.6,0.5
		c0.2,0,0.4,0.1,0.5,0.1c0.9,0,1.7-0.3,2.5-0.7c0.1,0,0.1-0.1,0.2-0.1c0.5-0.4,1-0.8,1.4-1.3c0.9,1.3,2.3,2.1,4,2.1
		c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1c0.2,0,0.4,0,0.5,0c0.6-0.1,1.1-0.2,1.6-0.5
		c0.8-0.4,1.4-0.9,1.9-1.6c0.9,1.3,2.3,2.1,4,2.1c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1c0.4,0,0.9-0.1,1.3-0.2
		c0.5-0.1,0.9-0.3,1.4-0.6C55.9,32.5,56.7,31.2,56.8,29.5L56.8,29.5L56.8,29.5z M12,32.5c-1.7,0-3-1.3-3.2-2.9h0l0-0.1l0-0.2
		L12,11.5h5.7l-0.2,1.6l-2.3,16.2l0,0.1h0C15.2,31.1,13.8,32.5,12,32.5z M23.2,29.3c0,1.8-1.4,3.2-3.2,3.2c-1.8,0-3.2-1.4-3.2-3.2
		l0,0l2.3-16.3l0.2-1.6h5.4l-0.1,1.6L23.2,29.3z M28,32.5c-1.8,0-3.2-1.4-3.2-3.2l0,0l1.5-16.3l0.1-1.6h4.8v1.6v16.3
		C31.2,31.1,29.8,32.5,28,32.5z M36,32.5c-1.8,0-3.2-1.4-3.2-3.2V13.1v-1.6h4.8l0.1,1.6l1.5,16.3h0C39.2,31.1,37.8,32.5,36,32.5z
		 M47.2,29.3c0,1.8-1.4,3.2-3.2,3.2c-1.7,0-3.1-1.3-3.2-3l0-0.2l0-0.1l-1.4-16.2l-0.1-1.6h5.4l0.2,1.6L47.2,29.3L47.2,29.3z
		 M55.2,29.6c-0.1,1.6-1.5,2.9-3.2,2.9c-1.7,0-3-1.3-3.2-2.9v-0.3l-2.3-16.3l-0.2-1.6H52l3.2,17.9l0,0l0,0L55.2,29.6L55.2,29.6z"/>
</g>
<g id="Black" class="st0">
	<g class="st1">
		<path class="st9" d="M16,34.3c-0.5,0.4-1,0.7-1.5,0.9v12.9h23.7V35.4c-0.5,0.2-1,0.3-1.6,0.3v10.9H16.1L16,34.3
			C16,34.4,16,34.3,16,34.3z"/>
		<path class="st9" d="M53.3,54.6h-1.8V41.7c0-2.1-1.7-3.8-3.8-3.8h-2.8c-2.1,0-3.8,1.7-3.8,3.8v12.9H11.5V35.7
			c-0.6,0-1.1-0.2-1.6-0.3v20.8h32.8V41.7c0-1.2,1-2.2,2.2-2.2h2.8c1.2,0,2.2,1,2.2,2.2v14.5h5V35c-0.5,0.3-1,0.4-1.6,0.6V54.6z"/>
		<path class="st9" d="M56.8,29.5l0-0.2L53.3,9.9H10.7L7.2,29.2l0,0.1l0,0.1l0,0.2h0c0.1,1.8,1.1,3.3,2.6,4c0.5,0.2,1,0.4,1.6,0.5
			c0.2,0,0.4,0.1,0.5,0.1c0.9,0,1.7-0.3,2.5-0.7c0.1,0,0.1-0.1,0.2-0.1c0.5-0.4,1-0.8,1.4-1.3c0.9,1.3,2.3,2.1,4,2.1
			c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1c0.2,0,0.4,0,0.5,0
			c0.6-0.1,1.1-0.2,1.6-0.5c0.8-0.4,1.4-0.9,1.9-1.6c0.9,1.3,2.3,2.1,4,2.1c1.7,0,3.1-0.9,4-2.1c0.9,1.3,2.3,2.1,4,2.1
			c0.4,0,0.9-0.1,1.3-0.2c0.5-0.1,0.9-0.3,1.4-0.6C55.9,32.5,56.7,31.2,56.8,29.5L56.8,29.5L56.8,29.5z M12,32.5
			c-1.7,0-3-1.3-3.2-2.9h0l0-0.1l0-0.2L12,11.5h5.7l-0.2,1.6l-2.3,16.2l0,0.1h0C15.2,31.1,13.8,32.5,12,32.5z M23.2,29.3
			c0,1.8-1.4,3.2-3.2,3.2c-1.8,0-3.2-1.4-3.2-3.2l0,0l2.3-16.3l0.2-1.6h5.4l-0.1,1.6L23.2,29.3z M28,32.5c-1.8,0-3.2-1.4-3.2-3.2
			l0,0l1.5-16.3l0.1-1.6h4.8v1.6v16.3C31.2,31.1,29.8,32.5,28,32.5z M36,32.5c-1.8,0-3.2-1.4-3.2-3.2V13.1v-1.6h4.8l0.1,1.6
			l1.5,16.3h0C39.2,31.1,37.8,32.5,36,32.5z M47.2,29.3c0,1.8-1.4,3.2-3.2,3.2c-1.7,0-3.1-1.3-3.2-3l0-0.2l0-0.1l-1.4-16.2l-0.1-1.6
			h5.4l0.2,1.6L47.2,29.3L47.2,29.3z M55.2,29.6c-0.1,1.6-1.5,2.9-3.2,2.9c-1.7,0-3-1.3-3.2-2.9v-0.3l-2.3-16.3l-0.2-1.6H52
			l3.2,17.9l0,0l0,0L55.2,29.6L55.2,29.6z"/>
	</g>
</g>
</svg>`;

myActorImgs['bank'] = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="80" height="80" viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
<style type="text/css">
	.st0{display:none;}
	.st1{display:inline;}
	.st2{fill:#FFFFFF;}
	.st3{fill:#B8B8B8;}
	.st4{fill:#727271;}
	.st5{display:inline;fill:#B8B8B8;}
	.st6{display:inline;fill:#727271;}
	.st7{fill:#141413;}
</style>
<g id="White" class="st0">
	<g class="st1">
		<path class="st2" d="M51.5,49.9v-5.3h-1V30.1h1v-3.7h-1.6v2.1h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3h-5.4v-5.3h-1V30.1h1v-3.7h-1.6
			v2.1h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3h-5.4v-5.3h-1V30.1h1v-3.7h-1.6v2.1h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3H7.2V56h1.6v-4.5h3.1
			h9.6h5.4h9.6h5.4h9.6h3.7V56h1.6v-6.1H51.5z M14.5,30.1h4.3v14.4h-4.3V30.1z M13.5,49.9v-3.7h6.4v3.7H13.5z M29.5,30.1h4.3v14.4
			h-4.3V30.1z M28.5,49.9v-3.7h6.4v3.7H28.5z M44.5,30.1h4.3v14.4h-4.3V30.1z M43.5,49.9v-3.7h6.4v3.7H43.5z"/>
		<path class="st2" d="M11,24.8h0.9h1.6h6.4h1.6h5.4h1.6h6.4h1.6h5.4h1.6h6.4h1.6H53c1.5,0,2-0.6,2.2-1.1c0.1-0.5,0.1-1.2-1.2-2.1
			L32,7L10.1,21.7c-1.3,0.8-1.4,1.6-1.2,2.1C9,24.2,9.5,24.8,11,24.8z M10.9,23L32,9l21.1,14c0.1,0.1,0.2,0.1,0.3,0.2
			c-0.1,0-0.2,0-0.3,0h-1.5h-9.6h-5.4h-9.6h-5.4h-9.6H11c-0.1,0-0.2,0-0.3,0C10.8,23.1,10.8,23.1,10.9,23z"/>
	</g>
</g>
<g id="Orange">
	<path class="st3" d="M51.5,49.9v-5.3h-1V30.1h1v-3.7h-1.6v2.1h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3h-5.4v-5.3h-1V30.1h1v-3.7h-1.6v2.1
		h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3h-5.4v-5.3h-1V30.1h1v-3.7h-1.6v2.1h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3 M14.5,30.1h4.3v14.4h-4.3
		V30.1z M13.5,49.9v-3.7h6.4v3.7H13.5z M29.5,30.1h4.3v14.4h-4.3V30.1z M28.5,49.9v-3.7h6.4v3.7H28.5z M44.5,30.1h4.3v14.4h-4.3
		V30.1z M43.5,49.9v-3.7h6.4v3.7H43.5z"/>
	<path class="st4" d="M11.9,49.9H7.2V56h1.6v-4.5h3.1h9.6h5.4h9.6h5.4h9.6h3.7V56h1.6v-6.1h-5.3 M26.9,49.9h-5.4 M41.9,49.9h-5.4
		 M19.9,49.9h-6.4 M34.9,49.9h-6.4 M49.9,49.9h-6.4"/>
	<path class="st4" d="M11,24.8h0.9h1.6h6.4h1.6h5.4h1.6h6.4h1.6h5.4h1.6h6.4h1.6H53c1.5,0,2-0.6,2.2-1.1c0.1-0.5,0.1-1.2-1.2-2.1
		L32,7L10.1,21.7c-1.3,0.8-1.4,1.6-1.2,2.1C9,24.2,9.5,24.8,11,24.8z M10.9,23L32,9l21.1,14c0.1,0.1,0.2,0.1,0.3,0.2
		c-0.1,0-0.2,0-0.3,0h-1.5h-9.6h-5.4h-9.6h-5.4h-9.6H11c-0.1,0-0.2,0-0.3,0C10.8,23.1,10.8,23.1,10.9,23z"/>
	<polyline class="st4" points="20.4,30.1 21.5,30.1 21.5,26.4 19.9,26.4 19.9,28.5 13.5,28.5 13.5,26.4 11.9,26.4 11.9,30.1 
		12.9,30.1 	"/>
	<polyline class="st4" points="35.4,30.1 36.5,30.1 36.5,26.4 34.9,26.4 34.9,28.5 28.5,28.5 28.5,26.4 26.9,26.4 26.9,30.1 
		27.9,30.1 	"/>
	<polyline class="st4" points="50.4,30.1 51.5,30.1 51.5,26.4 49.9,26.4 49.9,28.5 43.5,28.5 43.5,26.4 41.9,26.4 41.9,30.1 
		42.9,30.1 	"/>
	<polygon class="st4" points="13.5,49.9 13.5,46.1 19.9,46.1 19.9,49.9 21.5,49.9 21.5,44.5 11.9,44.5 11.9,49.9 	"/>
	<polygon class="st4" points="28.5,49.9 28.5,46.1 34.9,46.1 34.9,49.9 36.5,49.9 36.5,44.5 26.9,44.5 26.9,49.9 	"/>
	<polygon class="st4" points="43.5,49.9 43.5,46.1 49.9,46.1 49.9,49.9 51.5,49.9 51.5,44.5 41.9,44.5 41.9,49.9 	"/>
</g>
<g id="Green" class="st0">
	<path class="st5" d="M51.5,49.9v-5.3h-1V30.1h1v-3.7h-1.6v2.1h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3h-5.4v-5.3h-1V30.1h1v-3.7h-1.6v2.1
		h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3h-5.4v-5.3h-1V30.1h1v-3.7h-1.6v2.1h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3 M14.5,30.1h4.3v14.4h-4.3
		V30.1z M13.5,49.9v-3.7h6.4v3.7H13.5z M29.5,30.1h4.3v14.4h-4.3V30.1z M28.5,49.9v-3.7h6.4v3.7H28.5z M44.5,30.1h4.3v14.4h-4.3
		V30.1z M43.5,49.9v-3.7h6.4v3.7H43.5z"/>
	<path class="st6" d="M11.9,49.9H7.2V56h1.6v-4.5h3.1h9.6h5.4h9.6h5.4h9.6h3.7V56h1.6v-6.1h-5.3 M26.9,49.9h-5.4 M41.9,49.9h-5.4
		 M19.9,49.9h-6.4 M34.9,49.9h-6.4 M49.9,49.9h-6.4"/>
	<path class="st6" d="M11,24.8h0.9h1.6h6.4h1.6h5.4h1.6h6.4h1.6h5.4h1.6h6.4h1.6H53c1.5,0,2-0.6,2.2-1.1c0.1-0.5,0.1-1.2-1.2-2.1
		L32,7L10.1,21.7c-1.3,0.8-1.4,1.6-1.2,2.1C9,24.2,9.5,24.8,11,24.8z M10.9,23L32,9l21.1,14c0.1,0.1,0.2,0.1,0.3,0.2
		c-0.1,0-0.2,0-0.3,0h-1.5h-9.6h-5.4h-9.6h-5.4h-9.6H11c-0.1,0-0.2,0-0.3,0C10.8,23.1,10.8,23.1,10.9,23z"/>
	<polyline class="st6" points="20.4,30.1 21.5,30.1 21.5,26.4 19.9,26.4 19.9,28.5 13.5,28.5 13.5,26.4 11.9,26.4 11.9,30.1 
		12.9,30.1 	"/>
	<polyline class="st6" points="35.4,30.1 36.5,30.1 36.5,26.4 34.9,26.4 34.9,28.5 28.5,28.5 28.5,26.4 26.9,26.4 26.9,30.1 
		27.9,30.1 	"/>
	<polyline class="st6" points="50.4,30.1 51.5,30.1 51.5,26.4 49.9,26.4 49.9,28.5 43.5,28.5 43.5,26.4 41.9,26.4 41.9,30.1 
		42.9,30.1 	"/>
	<polygon class="st6" points="13.5,49.9 13.5,46.1 19.9,46.1 19.9,49.9 21.5,49.9 21.5,44.5 11.9,44.5 11.9,49.9 	"/>
	<polygon class="st6" points="28.5,49.9 28.5,46.1 34.9,46.1 34.9,49.9 36.5,49.9 36.5,44.5 26.9,44.5 26.9,49.9 	"/>
	<polygon class="st6" points="43.5,49.9 43.5,46.1 49.9,46.1 49.9,49.9 51.5,49.9 51.5,44.5 41.9,44.5 41.9,49.9 	"/>
</g>
<g id="Black" class="st0">
	<g class="st1">
		<path class="st7" d="M51.5,49.9v-5.3h-1V30.1h1v-3.7h-1.6v2.1h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3h-5.4v-5.3h-1V30.1h1v-3.7h-1.6
			v2.1h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3h-5.4v-5.3h-1V30.1h1v-3.7h-1.6v2.1h-6.4v-2.1h-1.6v3.7h1v14.4h-1v5.3H7.2V56h1.6v-4.5h3.1
			h9.6h5.4h9.6h5.4h9.6h3.7V56h1.6v-6.1H51.5z M14.5,30.1h4.3v14.4h-4.3V30.1z M13.5,49.9v-3.7h6.4v3.7H13.5z M29.5,30.1h4.3v14.4
			h-4.3V30.1z M28.5,49.9v-3.7h6.4v3.7H28.5z M44.5,30.1h4.3v14.4h-4.3V30.1z M43.5,49.9v-3.7h6.4v3.7H43.5z"/>
		<path class="st7" d="M11,24.8h0.9h1.6h6.4h1.6h5.4h1.6h6.4h1.6h5.4h1.6h6.4h1.6H53c1.5,0,2-0.6,2.2-1.1c0.1-0.5,0.1-1.2-1.2-2.1
			L32,7L10.1,21.7c-1.3,0.8-1.4,1.6-1.2,2.1C9,24.2,9.5,24.8,11,24.8z M10.9,23L32,9l21.1,14c0.1,0.1,0.2,0.1,0.3,0.2
			c-0.1,0-0.2,0-0.3,0h-1.5h-9.6h-5.4h-9.6h-5.4h-9.6H11c-0.1,0-0.2,0-0.3,0C10.8,23.1,10.8,23.1,10.9,23z"/>
	</g>
</g>
</svg>`;
