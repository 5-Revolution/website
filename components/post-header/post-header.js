export default async function initializePostHeader(e){var t,a;"loaded"!==e.dataset.status&&({createElement:t,markLoaded:a}=await import("../../../scripts/app.js"),buildPostHeader(e,{createElement:t}),a(e,"post-header"))}function buildPostHeader(e,{createElement:t}){var a=document.querySelector('meta[name="publication_date"]')||document.querySelector('meta[name="publication-date"]')||document.querySelector('meta[property="article:published_time"]'),a=a?a.content:"";let r="";a&&(i=(i=a.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/))?new Date(+i[3],+i[1]-1,+i[2]):new Date(a.includes("T")?a:a+"T00:00:00"),Number.isNaN(i.getTime())||(r=i.toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})));var a=document.querySelector('link[rel="canonical"]'),i=a?a.href:"file:"===window.location.protocol?"":window.location.href,a=encodeURIComponent(i),n=encodeURIComponent(document.title),o=i?"https://www.linkedin.com/sharing/share-offsite/?url="+a:"#",l=i?`https://twitter.com/intent/tweet?text=${n}&url=`+a:"#",i=i?`mailto:?subject=${n}&body=`+a:"#",n=t("div",["post-header"]),a=t("div",["post-header-date"]),t=(r&&(a.textContent="Published: "+r),t("div",["post-header-share"]));for(t.innerHTML=`
    <span class="post-header-share-label">Share</span>
    <a href="${o}" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" title="Share on LinkedIn">
      <img src="/icons/linkedin.svg" alt="" width="18" height="18">
    </a>
    <a href="${l}" target="_blank" rel="noopener noreferrer" aria-label="Share on X" title="Share on X">
      <img src="/icons/x.svg" alt="" width="18" height="18">
    </a>
    <a href="${i}" aria-label="Share via email" title="Share via email">
      <img src="/icons/email.svg" alt="" width="18" height="18">
    </a>
  `,n.appendChild(a),n.appendChild(t);e.firstChild;)e.removeChild(e.firstChild);e.appendChild(n)}