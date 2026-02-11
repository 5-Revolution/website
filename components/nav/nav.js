let LIGHT_NAV_PAGES=["contact"];export default async function initializeNav(a){var n,t;"loaded"!==a.dataset.status&&({createElement:n,markLoaded:t}=await import("../../../scripts/app.js"),buildNavbar(a,{createElement:n}),t(a,"nav"))}function buildNavbar(a,{createElement:n}){var t=LIGHT_NAV_PAGES.some(a=>document.body.classList.contains(a)),t=(a.classList.add("navbar","navbar-expand-lg","fixed-top"),t||a.classList.add("navbar-dark"),a.id="mainNav",[...a.children]),e=t[0],t=t[1],r=n("div",["container"]),e=e?.querySelector("a"),s=(e&&(e.classList.remove("btn","btn-link","btn-primary"),e.classList.add("navbar-brand"),e.id="navbarBrand",s=e.textContent.trim(),e.innerHTML=`<svg class="logo-mark" id="navbarLogo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="navbar-wheel-group" transform="translate(60,60)">
        <g class="navbar-v-group" data-index="0">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
        </g>
        <g class="navbar-v-group" data-index="1">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
        </g>
        <g class="navbar-v-group" data-index="2">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
        </g>
        <g class="navbar-v-group" data-index="3">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
        </g>
        <g class="navbar-v-group" data-index="4">
          <path d="M-9,-42 L0,-16 L9,-42" stroke="currentColor" stroke-width="4" stroke-linejoin="round" fill="none"/>
        </g>
      </g>
    </svg>`,(i=n("span",["navbar-brand-text"],{id:"navbarBrandText"})).textContent=s||"5th Revolution",e.appendChild(i),r.appendChild(e)),n("button",["navbar-toggler"],{type:"button","data-bs-toggle":"collapse","data-bs-target":"#navbarNav","aria-controls":"navbarNav","aria-expanded":"false","aria-label":"Toggle navigation"})),i=(s.innerHTML='<span class="navbar-toggler-icon"></span>',r.appendChild(s),t?.querySelector("ul"));if(i){i.classList.add("navbar-nav","align-items-lg-center");for(var l of i.querySelectorAll(":scope > li")){l.classList.add("nav-item");var o,d=l.querySelector("a");d&&(o=d.classList.contains("btn-primary"),d.classList.remove("btn","btn-link"),o?(l.classList.add("ms-lg-3"),d.classList.add("btn","btn-primary")):(d.classList.add("nav-link"),d.classList.length||d.removeAttribute("class")))}e=n("div",["collapse","navbar-collapse","justify-content-end"],{id:"navbarNav"});e.appendChild(i),r.appendChild(e)}for(;a.firstChild;)a.removeChild(a.firstChild);a.appendChild(r)}