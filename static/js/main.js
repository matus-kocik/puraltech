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
