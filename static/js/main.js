document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("carousel-track");
    let index = 0;
    const slideCount = track.children.length;

    function moveSlide() {
        index++;
        track.style.transition = "transform 0.7s ease-in-out";
        track.style.transform = `translateX(-${index * 100}%)`;

        if (index >= slideCount - 1) {
            setTimeout(() => {
                track.appendChild(track.firstElementChild);
                index--;
                track.style.transition = "none";
                track.style.transform = `translateX(-${index * 100}%)`;
            }, 700);
        }
    }

    setInterval(moveSlide, 4000);
});

// Open Cookie Preferences modal from footer link(s)
document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.js-open-cookie-settings');
    if (!trigger) return;
    e.preventDefault();
    if (window.CookieConsent && typeof CookieConsent.showPreferences === 'function') {
        CookieConsent.showPreferences();
    } else {
    // Fallback: try again shortly in case the library is still loading
    setTimeout(() => CookieConsent?.showPreferences?.(), 200);
    }
});
