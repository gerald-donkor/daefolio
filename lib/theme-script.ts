// Runs before body content paints; missing or unavailable storage defaults to dark.
export const themeScript = `(()=>{let p='dark';try{const s=localStorage.getItem('portfolio-theme-v1');if(s==='light'||s==='dark'||s==='system')p=s}catch{}const t=p==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.dataset.theme=t})()`;
