let LIGHT_NAV_PAGES=["contact"];export default async function initializeNav(a){var t,n;"loaded"!==a.dataset.status&&({createElement:t,markLoaded:n}=await import("../../../scripts/app.js"),buildNavbar(a,{createElement:t}),n(a,"nav"))}function buildNavbar(a,{createElement:r}){var t=LIGHT_NAV_PAGES.some(a=>document.body.classList.contains(a)),t=(a.classList.add("navbar","navbar-expand-lg","fixed-top"),t||a.classList.add("navbar-dark"),a.id="mainNav",[...a.children]),n=t[0],t=t[1],e=r("div",["container"]),n=n?.querySelector("a"),o=r("a",["navbar-brand"],{href:n?.getAttribute("href")||"/",id:"navbarBrand"}),i=(o.innerHTML=`<svg class="logo-mark" id="navbarLogo" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`,r("span",["navbar-brand-text"],{id:"navbarBrandText"})),n=(i.textContent=n?.textContent.trim()||"5th Revolution",o.appendChild(i),r("button",["navbar-toggler"],{type:"button","data-bs-toggle":"collapse","data-bs-target":"#navbarNav","aria-controls":"navbarNav","aria-expanded":"false","aria-label":"Toggle navigation"})),i=(n.innerHTML='<span class="navbar-toggler-icon"></span>',r("div",["collapse","navbar-collapse","justify-content-end"],{id:"navbarNav"}));let l=r("ul",["navbar-nav","align-items-lg-center"]);for((t?.querySelectorAll("li")||[]).forEach(a=>{var t,n,e,a=a.querySelector("a");a&&(t=r("li",["nav-item"]),n=a.getAttribute("href")||"#",e=a.textContent.trim(),a.classList.contains("btn-primary")?(t.classList.add("ms-lg-3"),(a=r("a",["btn","btn-primary"],{href:n})).textContent=e,t.appendChild(a)):((a=r("a",["nav-link"],{href:n})).textContent=e,t.appendChild(a)),l.appendChild(t))}),i.appendChild(l),e.appendChild(o),e.appendChild(n),e.appendChild(i);a.firstChild;)a.removeChild(a.firstChild);a.appendChild(e)}