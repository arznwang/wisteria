window.Vue = require('vue')

import docsearch from 'docsearch.js/dist/cdn/docsearch.js'
import PerfectScrollbar from 'perfect-scrollbar'

window.Prism = require('prismjs')

require('prismjs/components/prism-markup-templating.js')
require('prismjs/components/prism-bash.js')
require('prismjs/components/prism-git.js')
require('prismjs/components/prism-javascript.js')
require('prismjs/components/prism-json.js')
require('prismjs/components/prism-markup.js')
require('prismjs/components/prism-php.js')
require('prismjs/components/prism-sass.js')
require('prismjs/components/prism-scss.js')

const files = require.context('./components', true, /\.vue$/i)
files.keys().map(key =>
  Vue.component(
    key
      .split('/')
      .pop()
      .split('.')[0],
    files(key).default,
  ),
)

class Wisteria {
  constructor() {
    this.initVueInstances()
    this.reformatContent()
    this.replaceQuoteIcons()
    this.createSmoothScrollbar()
    this.initDocSearch()
    this.activateCurrentSection()
  }

  initVueInstances() {
    this.navbar = new Vue({ el: '#navbar' })
    this.content = new Vue({ el: '#content' })
  }

  reformatContent() {
    let content = document.querySelector('.markdown-body')
    let toc = []

    content.querySelectorAll('blockquote blockquote').forEach(blockquote => {
      blockquote.outerHTML = blockquote.innerHTML
    })

    content.querySelectorAll('h2, h3').forEach((heading, index) => {
      let title = heading.textContent
      let name = `heading-${heading.tagName.toLowerCase()}-${index}`
      let link = `#${name}`
      let level = parseInt(heading.tagName.substr(1)) - 1
      toc.push({ title, link, name, level })
      let anchor = document.createElement('a')
      anchor.classList.add('anchor-link')
      anchor.setAttribute('name', name)
      anchor.setAttribute('href', link)
      anchor.insertAdjacentHTML(
        'beforeend',
        `<svg style="width:18px;height:18px" viewBox="0 0 24 24">
        <path fill="currentColor" d = "M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z" />
</svg >`,
      )
      heading.prepend(anchor)
    })

    toc.reverse().forEach(item => {
      document
        .querySelector('#toc .anchors')
        .insertAdjacentHTML(
          'afterend',
          `<a href="${item.link}" data-anchor="${item.name}" class="level-${item.level} py-1 -ml-4 pl-${item.level *
            4} block text-gray-600 truncate border-l-2 border-transparent">${item.title}</a>`,
        )
    })

    window.onhashchange = this.handleAnchorLinkActiveStatus
  }

  createSmoothScrollbar() {
    let options = {
      wheelSpeed: 2,
      suppressScrollX: false,
      wheelPropagation: true,
      minScrollbarLength: 20,
    }

    let content = document.querySelector('#content')

    new PerfectScrollbar('#sidebar .docs-index', options)
    let ps = new PerfectScrollbar(content, options)
    content.addEventListener('ps-scroll-y', () => this.handleAnchorLinkActiveStatus(ps))
  }

  activateCurrentSection() {
    let nav = document.querySelector('#sidebar .docs-index')
    let current = nav.querySelector('ul li a[href="' + WITERIA_FULL_URL + '"]')

    nav.querySelectorAll('ul li a').forEach(li => {
      li.classList.add('px-4', 'py-1', 'block', '-ml-4')
    })

    if (current) {
      current.classList.add('is-active', 'bg-white', 'border', 'border-r-0', 'py-2')
      current.parentElement.classList.add('is-active')
    }
    if (current.getBoundingClientRect().top >= window.screen.height * 0.4) {
      nav.scrollTop = current.getBoundingClientRect().top - window.screen.height * 0.4
    }
  }

  handleAnchorLinkActiveStatus(scrollbar) {
    document.querySelectorAll(`#content a.anchor-link`).forEach(anchor => {
      let anchorPosition = anchor.getBoundingClientRect()

      if (
        anchorPosition.top <= scrollbar.lastScrollTop &&
        Math.abs(scrollbar.lastScrollTop - anchorPosition.top) <= window.screen.height * 300
      ) {
        this.setCurrentAnchor(anchor.hash)
      }
    })
  }

  setCurrentAnchor(hash = null) {
    hash = hash || window.location.hash
    let link = document.querySelector(`#toc a[href="${hash}"]`)

    if (link) {
      let previous = document.querySelector('#toc a.is-active')
      if (previous) {
        previous.classList.remove('is-active', 'font-semibold', 'border-gray-800', 'text-gray-800')
      }

      link.classList.add('is-active', 'font-semibold', 'border-gray-800', 'text-gray-800')
    }
  }

  initDocSearch() {
    docsearch({
      // Your apiKey and indexName will be given to you once
      apiKey: WISTERIA_DOCS_DOCSEARCH_API_KEY,
      indexName: WISTERIA_DOCS_DOCSEARCH_INDEX_NAME,
      // Replace inputSelector with a CSS selector
      // matching your search input
      inputSelector: '#search-input',
      // Set debug to true if you want to inspect the dropdown
      debug: false,
    })
  }

  replaceQuoteIcons() {
    document.querySelectorAll('.markdown-body blockquote').forEach(function(blockquote) {
      let match = blockquote.innerHTML.match(/\{(.*?)\}/)
      if (!match) {
        return
      }
      const icon = match[1]

      let icons = {
        info:
          '<svg class="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7 13.33a7 7 0 1 1 6 0V16H7v-2.67zM7 17h6v1.5c0 .83-.67 1.5-1.5 1.5h-3A1.5 1.5 0 0 1 7 18.5V17zm2-5.1V14h2v-2.1a5 5 0 1 0-2 0z"></path></svg>',
        warning:
          '<svg class="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 5h2v6H9V5zm0 8h2v2H9v-2z"></path></svg>',
      }
      icons.note = icons.info
      icons.tips = icons.warning

      blockquote.innerHTML = `<div class="flag"><span class="svg">${icons[icon]}</span></div><div>${blockquote.innerHTML.replace(
        /\{(.*?)\}/,
        '',
      )}</div>`
      blockquote.classList.add(icon)
    })
  }
}

new Wisteria()
