/*function loader() {
    document.getElementById("nav_menuButton").addEventListener('click', menuButton);

    console.log("Hello");

    if (window.innerWidth < 700) {
        document.querySelector("#nav_menu").classList.add("nav_menu_inactive");
    }

    document.querySelector("figcaption").style.top = "calc(-" + document.getElementById("captionImg").clientWidth + "px / 2 + 10vw)";
    console.log(document.querySelector("figcaption").style.top);
}*/

function menuButton() {

    document.querySelector("nav").classList.toggle("nav_dropdown_active");

    document.getElementById("nav_menuButton").classList.toggle("change");

    document.getElementsByClassName("bar1")[0].classList.toggle("nav_menuButton_inactive");
    document.getElementsByClassName("bar1")[0].classList.toggle("nav_menuButton_active");

    document.getElementsByClassName("bar2")[0].classList.toggle("nav_menuButton_inactive");
    document.getElementsByClassName("bar2")[0].classList.toggle("nav_menuButton_active");

    document.getElementsByClassName("bar3")[0].classList.toggle("nav_menuButton_inactive");
    document.getElementsByClassName("bar3")[0].classList.toggle("nav_menuButton_active");

    document.querySelector("#nav_menu").classList.toggle("nav_menu_active");
    document.querySelector("#nav_menu").classList.toggle("nav_menu_inactive");

    const menuItems = document.querySelectorAll(".nav_menu_item");

    menuItems.forEach(menuItem => {
        menuItem.classList.toggle("nav_menu_item_active");
    });

    document.body.classList.toggle("body_dropdown");


}

function loader() {

    document.querySelector("figcaption").style.top = "calc(-" + document.getElementById("captionImg").clientWidth + "px / 2 + 10vw)";
    document.querySelector("menuButton").addEventListener('click', menuButton);

    if (window.innerWidth < window.innerHeight) {
        //document.querySelector("header").classList.add("header_style");
    } else {
        //document.querySelector("nav").classList.add("nav_style");
        document.querySelector("header").classList.remove("header");

    }

    
}

function menuButton() {

    document.querySelector("nav").classList.toggle("nav_dropdown_active");

    if (window.scrollY != 0) {
        document.querySelector("header").classList.toggle("header_style");
    } else {
        document.querySelector("header").classList.toggle("header");
    }
        

    document.querySelector("menuButton").classList.toggle("change");

    document.querySelector("menuItems").classList.toggle("menuItems_active");
    document.querySelector("menuItems").classList.toggle("menuItems_inactive");

    const menuItems = document.querySelectorAll("item");

    menuItems.forEach(menuItem => {
        menuItem.classList.toggle("menuItem_active");
    });

    document.querySelector("html").classList.toggle("tog");

    document.body.classList.toggle("body_dropdown");
}

window.onload = loader;
window.onresize = loader;


var prevScrollPos = window.scrollY;

function adjustNavBar() {
    var currentScrollPos = window.scrollY;

    const navbar = document.querySelector("nav");
    const header = document.querySelector("header");

    if (window.innerWidth >= 700) {
        if (prevScrollPos > currentScrollPos) {
            navbar.classList.add("nav_style");
            navbar.classList.remove("nav_push");
    
            if (currentScrollPos == 0) {
                navbar.classList.remove("nav_style");
                navbar.classList.remove("nav_push");
            }
    
        } else {
            navbar.classList.remove("nav_style");
            navbar.classList.add("nav_push");
        }
    } else {
        if (prevScrollPos > currentScrollPos) {
            header.classList.add("header");
            header.classList.add("header_style");
            navbar.classList.remove("nav_push");
    
            if (currentScrollPos == 0) {
                header.classList.remove("header");
                header.classList.remove("header_style");
                navbar.classList.remove("nav_push");
            }
    
        } else {
            header.classList.remove("header");
            header.classList.remove("header_style");
            navbar.classList.add("nav_push");
        }
    }

    const img = document.getElementById("captionImg");
    const figcaption = document.querySelector("figcaption");
    const figure = document.querySelector("figure");

    if (figure.clientHeight < img.clientHeight - window.innerWidth * 0.2 - currentScrollPos/2) {
        //img.style.marginTop = "calc(-20vw - " + currentScrollPos/2 + "px)";
        img.style.marginTop = "calc( (75vh - 100%) / 3  - " + currentScrollPos/2 + "px)";
        figcaption.style.top = "calc(-" + img.clientWidth + "px / 2 + 10vw + " + currentScrollPos/2 + "px)";
    }

    /*if (currentScrollPos/2 < (figure.clientWidth - window.innerHeight*0.75 - window.innerWidth*0.4)/2 && (figure.clientWidth)/2 > window.innerHeight*0.75 - window.innerWidth*0.2) {
        
        img.style.marginTop = "calc(-20vw - " + currentScrollPos/2 + "px)";
        //figcaption.style.top = "calc(-" + figure.clientHeight + "px - 10vw  + 75vh - 20vw + " + currentScrollPos/2 + "px)";
        figcaption.style.top = "calc(-" + img.clientWidth + "px / 2 + " + currentScrollPos/2 + "px)";
    }*/
    
    //figcaption.style.top = "calc(-" + img.style.width + "px / 2 + " + currentScrollPos/2 + "px)";
    
    
    prevScrollPos = currentScrollPos;
}

window.onscroll = adjustNavBar;
window.onload = loader;
window.onresize = loader;