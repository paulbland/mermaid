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

export const drawImageSVG = function (elem, rectData, key) {
  const imgElem = elem.append('g')
  imgElem.attr('transform', 'translate('+(rectData.x + 50)+', '+(rectData.y - 150)+')');
  imgElem.html(myActorImgs[key]);
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
    drawImageSVG(g, rect, key)
    rect.y = (rect.y - 55) // pull text up a bit // TO DO - remove magic number
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
myActorImgs['consumer'] = `<svg width=\"100\" height=\"100\" viewbox="0 0 200 200" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:cc=\"http://creativecommons.org/ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\">
<metadata>
 <rdf:RDF>
  <cc:Work rdf:about=\"\">
   <dc:format>image/svg+xml</dc:format>
   <dc:type rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\"/>
   <dc:title/>
  </cc:Work>
 </rdf:RDF>
</metadata>
<g transform=\"translate(1565.7 -1080)\">
 <g transform=\"matrix(3.1437 0 0 3.1437 -4835.7 -1027.6)\">
  <g transform=\"matrix(1.25 0 0 -1.25 1102.5 727.74)\">
   <path d=\"m0 0v-0.103h0.095c0.021 0 0.039 5e-3 0.052 0.013 0.012 8e-3 0.019 0.022 0.019 0.039s-7e-3 0.03-0.019 0.038c-0.013 9e-3 -0.031 0.013-0.052 0.013zm0.096 0.072c0.049 0 0.087-0.011 0.114-0.033s0.04-0.052 0.04-0.09c0-0.032-0.01-0.058-0.032-0.079-0.021-0.02-0.051-0.033-0.091-0.038l0.126-0.145h-0.098l-0.117 0.144h-0.038v-0.144h-0.082v0.385zm-0.025-0.518c0.045 0 0.087 9e-3 0.125 0.026 0.039 0.017 0.073 0.04 0.102 0.069s0.052 0.063 0.069 0.103c0.016 0.039 0.025 0.081 0.025 0.126s-9e-3 0.087-0.025 0.126c-0.017 0.039-0.04 0.074-0.069 0.103s-0.063 0.052-0.102 0.069c-0.038 0.016-0.08 0.024-0.125 0.024s-0.088-8e-3 -0.127-0.024c-0.04-0.017-0.075-0.04-0.104-0.069s-0.052-0.064-0.068-0.103c-0.017-0.039-0.025-0.081-0.025-0.126s8e-3 -0.087 0.025-0.126c0.016-0.04 0.039-0.074 0.068-0.103s0.064-0.052 0.104-0.069c0.039-0.017 0.082-0.026 0.127-0.026m0 0.739c0.059 0 0.113-0.011 0.165-0.033 0.051-0.021 0.095-0.051 0.134-0.089 0.038-0.037 0.068-0.081 0.09-0.132 0.022-0.05 0.033-0.104 0.033-0.161s-0.011-0.111-0.033-0.161-0.052-0.094-0.09-0.132c-0.039-0.037-0.083-0.067-0.134-0.089-0.052-0.022-0.106-0.033-0.165-0.033-0.06 0-0.115 0.011-0.167 0.033s-0.097 0.052-0.135 0.089c-0.038 0.038-0.068 0.082-0.09 0.132s-0.033 0.104-0.033 0.161 0.011 0.111 0.033 0.161c0.022 0.051 0.052 0.095 0.09 0.132 0.038 0.038 0.083 0.068 0.135 0.089 0.052 0.022 0.107 0.033 0.167 0.033m-38.961 1.483c0 0.734 0.481 1.337 1.267 1.337 0.751 0 1.258-0.577 1.258-1.337s-0.507-1.337-1.258-1.337c-0.786 0-1.267 0.603-1.267 1.337m3.381 0v2.088h-0.908v-0.507c-0.288 0.376-0.725 0.612-1.319 0.612-1.171 0-2.089-0.918-2.089-2.193 0-1.276 0.918-2.193 2.089-2.193 0.594 0 1.031 0.236 1.319 0.612v-0.507h0.908zm30.684 0c0 0.734 0.481 1.337 1.267 1.337 0.752 0 1.258-0.577 1.258-1.337s-0.506-1.337-1.258-1.337c-0.786 0-1.267 0.603-1.267 1.337m3.382 0v3.765h-0.909v-2.184c-0.288 0.376-0.725 0.612-1.319 0.612-1.171 0-2.089-0.918-2.089-2.193 0-1.276 0.918-2.193 2.089-2.193 0.594 0 1.031 0.236 1.319 0.612v-0.507h0.909zm-22.795 1.38c0.585 0 0.961-0.367 1.057-1.013h-2.167c0.097 0.603 0.463 1.013 1.11 1.013m0.018 0.813c-1.224 0-2.08-0.891-2.08-2.193 0-1.328 0.891-2.193 2.141-2.193 0.629 0 1.205 0.157 1.712 0.585l-0.445 0.673c-0.35-0.279-0.796-0.437-1.215-0.437-0.585 0-1.118 0.271-1.249 1.023h3.101c9e-3 0.113 0.018 0.227 0.018 0.349-9e-3 1.302-0.813 2.193-1.983 2.193m10.964-2.193c0 0.734 0.481 1.337 1.267 1.337 0.751 0 1.258-0.577 1.258-1.337s-0.507-1.337-1.258-1.337c-0.786 0-1.267 0.603-1.267 1.337m3.381 0v2.088h-0.908v-0.507c-0.289 0.376-0.725 0.612-1.319 0.612-1.171 0-2.089-0.918-2.089-2.193 0-1.276 0.918-2.193 2.089-2.193 0.594 0 1.03 0.236 1.319 0.612v-0.507h0.908zm-8.509 0c0-1.267 0.882-2.193 2.228-2.193 0.629 0 1.048 0.14 1.502 0.498l-0.436 0.734c-0.341-0.245-0.699-0.376-1.093-0.376-0.725 9e-3 -1.258 0.533-1.258 1.337s0.533 1.328 1.258 1.337c0.394 0 0.752-0.131 1.093-0.376l0.436 0.734c-0.454 0.358-0.873 0.498-1.502 0.498-1.346 0-2.228-0.926-2.228-2.193m11.707 2.193c-0.524 0-0.865-0.245-1.101-0.612v0.507h-0.9v-4.176h0.909v2.341c0 0.691 0.297 1.075 0.891 1.075 0.184 0 0.376-0.026 0.568-0.105l0.28 0.856c-0.201 0.079-0.463 0.114-0.647 0.114m-24.341-0.437c-0.437 0.288-1.039 0.437-1.703 0.437-1.058 0-1.739-0.507-1.739-1.337 0-0.681 0.507-1.101 1.441-1.232l0.429-0.061c0.498-0.07 0.733-0.201 0.733-0.437 0-0.323-0.332-0.507-0.952-0.507-0.629 0-1.083 0.201-1.389 0.437l-0.428-0.707c0.498-0.367 1.127-0.542 1.808-0.542 1.206 0 1.905 0.568 1.905 1.363 0 0.734-0.55 1.118-1.459 1.249l-0.428 0.062c-0.393 0.052-0.708 0.13-0.708 0.41 0 0.306 0.297 0.489 0.795 0.489 0.533 0 1.049-0.201 1.302-0.358zm11.716 0.437c-0.524 0-0.865-0.245-1.1-0.612v0.507h-0.9v-4.176h0.908v2.341c0 0.691 0.297 1.075 0.891 1.075 0.184 0 0.376-0.026 0.568-0.105l0.28 0.856c-0.201 0.079-0.463 0.114-0.647 0.114m-7.749-0.105h-1.485v1.267h-0.918v-1.267h-0.847v-0.83h0.847v-1.905c0-0.969 0.376-1.546 1.45-1.546 0.394 0 0.848 0.122 1.136 0.323l-0.262 0.778c-0.271-0.157-0.568-0.236-0.804-0.236-0.454 0-0.602 0.28-0.602 0.699v1.887h1.485zm-13.577-4.176v2.621c0 0.987-0.629 1.651-1.643 1.66-0.533 9e-3 -1.083-0.157-1.468-0.743-0.288 0.463-0.742 0.743-1.38 0.743-0.446 0-0.882-0.131-1.223-0.62v0.515h-0.909v-4.176h0.917v2.315c0 0.725 0.402 1.11 1.023 1.11 0.603 0 0.908-0.393 0.908-1.101v-2.324h0.918v2.315c0 0.725 0.419 1.11 1.022 1.11 0.62 0 0.917-0.393 0.917-1.101v-2.324z\" fill=\"#231f20\"/>
  </g>
  <g transform=\"matrix(1.25 0 0 -1.25 1103.2 710.77)\">
   <path d=\"m0 0v0.61h-0.159l-0.184-0.419-0.183 0.419h-0.16v-0.61h0.113v0.46l0.172-0.397h0.117l0.172 0.398v-0.461zm-1.009 0v0.506h0.204v0.103h-0.52v-0.103h0.204v-0.506z\" fill=\"#f79410\"/>
  </g>
  <path d=\"m1080.6 714.05h-17.202v-30.915h17.202z\" fill=\"#ff5f00\"/>
  <g transform=\"matrix(1.25 0 0 -1.25 1064.5 698.59)\">
   <path d=\"m0 0c0 5.017 2.349 9.486 6.007 12.366-2.675 2.106-6.051 3.363-9.72 3.363-8.686 0-15.727-7.042-15.727-15.729s7.041-15.729 15.727-15.729c3.669 0 7.045 1.257 9.72 3.363-3.658 2.88-6.007 7.349-6.007 12.366\" fill=\"#eb001b\"/>
  </g>
  <g transform=\"matrix(1.25 0 0 -1.25 1103.8 698.59)\">
   <path d=\"m0 0c0-8.687-7.041-15.729-15.727-15.729-3.669 0-7.045 1.257-9.721 3.363 3.659 2.88 6.008 7.349 6.008 12.366s-2.349 9.486-6.008 12.366c2.676 2.106 6.052 3.363 9.721 3.363 8.686 0 15.727-7.042 15.727-15.729\" fill=\"#f79e1b\"/>
  </g>
 </g>
</g>
</svg>`;

myActorImgs['wallet'] = `<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">
  <g fill=\"white\" stroke=\"red\" stroke-width=\"5\">
    <circle cx=\"40\" cy=\"40\" r=\"25\" />
  </g>
</svg>`;

myActorImgs['app_server'] = `<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">
<g fill=\"white\" stroke=\"green\" stroke-width=\"5\">
  <circle cx=\"40\" cy=\"40\" r=\"25\" />
</g>
</svg>`;

myActorImgs['masterpass_qr'] = `<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">
<g fill=\"white\" stroke=\"blue\" stroke-width=\"5\">
  <circle cx=\"40\" cy=\"40\" r=\"25\" />
</g>
</svg>`;

myActorImgs['rec_inst_server'] = `<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">
<g fill=\"white\" stroke=\"orange\" stroke-width=\"5\">
  <circle cx=\"40\" cy=\"40\" r=\"25\" />
</g>
</svg>`;

myActorImgs['merchant'] = `<svg width=\"100\" height=\"100\" viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\">
<g fill=\"white\" stroke=\"purple\" stroke-width=\"5\">
  <circle cx=\"40\" cy=\"40\" r=\"25\" />
</g>
</svg>`;
