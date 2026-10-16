function show_closeSearch(){
    const search_input = document.querySelector('.navbar__search-input-text');
    const search_icon = document.querySelector('.navbar__search-icon');
    const search = document.querySelector('.navbar__search');
    search_icon.addEventListener('click',function(){
        search_input.classList.toggle('active');
        search.classList.toggle('navbar__search-color')
    })
}
show_closeSearch();
function show_Menu(){
    function show(){
        menu_category.classList.add('show');
        over_lay.classList.add('show')
    }
    function close(){
        menu_category.classList.remove('show');
        over_lay.classList.remove('show')
    }
    const menu= document.querySelector('.navbar__menu');
    const menu_category = document.querySelector('.navbar__menu-category');
    const btn_close = document.querySelector('.navbar__menu-close');
    const over_lay = document.querySelector('.over_lay');
    menu.addEventListener('click',show);
    btn_close.addEventListener('click', (e) => {
    e.stopPropagation(); // dừng sự kiện tại đây, không lên cha nữa
    close();
    });
    over_lay.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
    });
}
show_Menu();
function Count_time(){
    const hours = document.querySelector('.flashsale__left-hour');
    const minutes = document.querySelector('.flashsale__left-minutes');
    const seconds = document.querySelector('.flashsale__left-second');
    let time = Number(hours.textContent)*3600 + Number(minutes.textContent)*60 + Number(seconds.textContent);
    // kiểm tra xem có đủ 2 chữ số ko
    function check_time(n) {
       return n < 10 ? "0" + n : n;
    }
    function show_time(){
        hours.textContent = check_time(Math.floor(time/3600));
        minutes.textContent = check_time(Math.floor((time % 3600)/60));
        seconds.textContent = check_time(Math.floor(time % 60))
    }
    let timer = setInterval(function(){
         time = time -1;
         show_time();
         if(time <= 0 ){
            clearInterval(timer);
         }
    },1000)
}
Count_time();
