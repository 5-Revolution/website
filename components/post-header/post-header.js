export default async function initializePostHeader(e){var t,a;"loaded"!==e.dataset.status&&({createElement:t,markLoaded:a}=await import("../../../scripts/app.js"),buildPostHeader(e,{createElement:t}),a(e,"post-header"))}function buildPostHeader(e,{createElement:t}){var a=document.querySelector('meta[name="publication_date"]')||document.querySelector('meta[name="publication-date"]')||document.querySelector('meta[property="article:published_time"]'),a=a?a.content:"";let r="";a&&(n=(n=a.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/))?new Date(+n[3],+n[1]-1,+n[2]):new Date(a.includes("T")?a:a+"T00:00:00"),Number.isNaN(n.getTime())||(r=n.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})));var a=document.querySelector('link[rel="canonical"]'),n=a?a.getAttribute("href"):window.location.pathname,a=encodeURIComponent(n),i=encodeURIComponent(document.title),o=n?"https://www.linkedin.com/sharing/share-offsite/?url="+a:"#",l=n?`https://twitter.com/intent/tweet?text=${i}&url=`+a:"#",n=n?`mailto:?subject=${i}&body=`+a:"#",i=t("div",["post-header-date"]),a=(r?i.textContent="Published: "+r:i.style.display="none",t("div",["post-header-share"]));for(a.innerHTML=`
    <span class="post-header-share-label">Share</span>
    <a href="${o}" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn">
      <img src="/icons/linkedin.svg" alt="" width="18" height="18">
    </a>
    <a href="${l}" target="_blank" rel="noopener noreferrer" aria-label="Share on X" title="Share on X">
      <img src="/icons/x.svg" alt="" width="18" height="18">
    </a>
    <a href="${n}" aria-label="Share via email" title="Share via email">
      <img src="/icons/email.svg" alt="" width="18" height="18">
    </a>
  `;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(i),e.appendChild(a)}