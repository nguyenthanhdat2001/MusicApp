// 1. Render song --> OK
// 2. Scroll top --> OK
// 3. Play / pause / seek --> OK (bug)
// 4. CD rotate --> OK 
// 5. Next / prev ==> OK
// 6. Random ==>
// 7. Next / Repeat when ended
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click 

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const STORAGE_KEY = 'Player'

let listSong = $('.wrapper')
let header = $('header h2')
let disk = $('.disk')
let diskImg = $('.disk img')
let audio = $('#audio')
let start = $('#start')
let end = $('#end')
let progress = $('#progress')
let playBtn = $('.play')
let prevBtn = $('.prev')
let nextBtn = $('.next')
let repeatBtn = $('.repeat')
let randomBtn = $('.random')

var app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isLoop: false,
    config: JSON.parse(localStorage.getItem(STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            id: 1,
            name: 'Lý do là gì remix',
            song: 'music/Li_do_la_gi.mp3',
            image: 'https://avatar-ex-swe.nixcdn.com/song/share/2021/11/25/c/0/d/d/1637837879833.jpg',
            description: 'Lorem ipsum dolor sit amet, consectetur adip, Lorem ipsum dolor sit amet, consectetur adip'
        },
        {
            id: 2,
            name: 'Đau lòng remix',
            song: 'music/Dau_long.mp3',
            image: 'https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_jpeg/cover/e/d/0/e/ed0ecbb554a18a88ea302cc2d8bf8f3b.jpg',
            description: 'Lorem ipsum dolor sit amet, consectetur adip'

        },
        {
            id: 3,
            name: 'Khi yêu nào đâu ai muốn',
            song: 'music/Khi_yeu_nao_dau_ai_muon.mp3',
            image: 'https://i.ytimg.com/vi/Ew_RsNe2cgo/maxresdefault.jpg',
            description: 'Lorem ipsum dolor sit amet, consectetur adip'
        },
        {
            id: 4,
            name: 'Lý do là gì remix 2',
            song: 'music/Li_do_la_gi.mp3',
            image: 'https://avatar-ex-swe.nixcdn.com/song/share/2021/11/25/c/0/d/d/1637837879833.jpg',
            description: 'Lorem ipsum dolor sit amet, consectetur adip'
        },
        {
            id: 5,
            name: 'Đau lòng remix 2',
            song: 'music/Dau_long.mp3',
            image: 'https://photo-resize-zmp3.zmdcdn.me/w240_r1x1_jpeg/cover/e/d/0/e/ed0ecbb554a18a88ea302cc2d8bf8f3b.jpg',
            description: 'Lorem ipsum dolor sit amet, consectetur adip'

        },
        {
            id: 6,
            name: 'Khi yêu nào đâu ai muốn 2',
            song: 'music/Khi_yeu_nao_dau_ai_muon.mp3',
            image: 'https://i.ytimg.com/vi/Ew_RsNe2cgo/maxresdefault.jpg',
            description: 'Lorem ipsum dolor sit amet, consectetur adip'
        },
    ],
    renderSong() {
        const _this = this
        const html = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-id=${index}>
                    <div class="image-song">
                        <img src="${song.image}" alt="${song.name}" />
                    </div>
                    <div class="content">
                        <h4>${song.name}</h4>
                        <p>${song.description}</p>
                    </div>
                    <div class="option flex-center">
                        <ion-icon name="ellipsis-horizontal-outline"></ion-icon>
                    </div>
                </div>
            `
        })
        listSong.innerHTML = html.join('')
    },
    handleEvent() {
        const _this = this
        const disk = $('.disk')
        const cdWidth = disk.offsetWidth

        // CD rotate
        const CDthumb = disk.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 20000,
            iterations: Infinity,
        })
        CDthumb.pause()

        //Resize Disk CD
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCD = cdWidth - scrollTop
            $('.disk').style.width = newCD > 0 ? newCD + 'px' : 0
            $('.disk').style.height = newCD > 0 ? newCD + 'px' : 0
            $('.disk').style.opacity = parseInt(newCD) / cdWidth
        }

        // Play / pause / seek
        playBtn.onclick = function () {
            if (!this.isPlaying) {
                this.isPlaying = true
                audio.play()
            } else {
                this.isPlaying = false
                audio.pause()
            }
        }
        audio.onplay = function () {
            CDthumb.play()
            playBtn.innerHTML = '<ion-icon name="pause-outline"></ion-icon>'
        }
        audio.onpause = function () {
            CDthumb.pause()
            playBtn.innerHTML = '<ion-icon name="play-outline"></ion-icon>'
        }

        // Progress change
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const currentTime = audio.currentTime
                const songTime = audio.duration
                const percent = currentTime / songTime
                progress.value = `${percent * 100}`
                start.textContent = // get digital number ("0" + time).slice(-2)
                    `${('0' + Math.floor(currentTime / 60)).slice(-2)}:${('0' + Math.floor(currentTime % 60)).slice(-2)}`
                end.textContent =
                    `${('0' + Math.floor(songTime / 60)).slice(-2)}:${('0' + Math.floor(songTime % 60)).slice(-2)}`
            }
        }
        // Seek handler
        progress.onchange = function (e) {
            const seek = e.target.value / 100 * audio.duration
            audio.currentTime = seek
        }

        //Next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.renderSong()
            _this.scrollTop()
        }

        //Prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.renderSong()
            _this.scrollTop()
        }

        //Random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            this.classList.toggle('active', _this.isRandom)
        }

        //End song
        audio.onended = function () {
            if (_this.isLoop) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        //Loop song
        repeatBtn.onclick = function () {
            _this.isLoop = !_this.isLoop
            _this.setConfig('isLoop', _this.isLoop)
            this.classList.toggle('active', _this.isLoop)
        }

        //Active song when click
        listSong.onclick = function (e) {
            const songElement = e.target.closest('.song:not(.active)')
            if (songElement || e.target.closest('.option')) {
                if (songElement) {
                    _this.currentIndex = Number(songElement.dataset.id)
                    _this.loadCurrentSong()
                    _this.renderSong()
                    audio.play()
                }
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    defineProperty() {
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex]
            }
        })
    },
    loadCurrentSong() {
        // console.log(this.currentSong)
        header.textContent = this.currentSong.name
        diskImg.src = this.currentSong.image
        audio.src = this.currentSong.song
    },
    nextSong() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong() {
        console.log(this.songs.length)
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        console.log(newIndex)
        this.loadCurrentSong()
    },
    scrollTop() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300)
    },
    loadConfig() {
        this.isRandom = this.config.isRandom
        this.isLoop = this.config.isLoop
    },
    start() {
        this.loadConfig()
        this.defineProperty()
        this.handleEvent()
        this.loadCurrentSong() //tai thong tin bai hat dau tien
        this.renderSong()

        // load status function
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isLoop)
    }
}

app.start()


