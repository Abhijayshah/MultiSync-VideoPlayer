class VideoPlayer {
    constructor(id, container) {
        this.id = id;
        this.container = container;
        this.playlist = [];
        this.currentVideoIndex = 0;
        this.isShuffled = false;
        this.shuffledPlaylist = [];
        this.isActive = false;
        
        this.createElement();
        this.setupEventListeners();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'video-player-instance';
        this.element.dataset.playerId = this.id;
        
        this.element.innerHTML = `
            <div class="player-header">
                <h4>🎬 Player ${this.id}</h4>
                <div class="player-controls">
                    <button class="remove-player-btn" data-player-id="${this.id}">❌</button>
                    <button class="minimize-player-btn" data-player-id="${this.id}">➖</button>
                </div>
            </div>
            
            <div class="video-container">
                <video class="video-element" controls>
                    <source class="video-source" src="" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-overlay"></div>
            </div>

            <div class="file-input-container">
                <input type="file" class="file-input" accept=".mp4,.mov,.avi,.mkv" multiple>
                <label class="file-input-label">
                    📁 Select Videos for Player ${this.id}
                </label>
            </div>

            <div class="player-controls-section">
                <div class="control-group">
                    <h5>🎮 Playback Controls</h5>
                    <div class="button-group">
                        <button class="play-pause-btn">⏯️ Play/Pause</button>
                        <button class="skip-back-btn">⏪ -10s</button>
                        <button class="skip-forward-btn">⏩ +10s</button>
                        <button class="restart-btn">🔄 Restart</button>
                    </div>
                </div>

                <div class="control-group">
                    <h5>⚡ Speed Controls (Up to 10x)</h5>
                    <div class="speed-controls">
                        <button class="speed-btn" data-speed="0.25">0.25x</button>
                        <button class="speed-btn" data-speed="0.5">0.5x</button>
                        <button class="speed-btn" data-speed="0.75">0.75x</button>
                        <button class="speed-btn active" data-speed="1">1x</button>
                        <button class="speed-btn" data-speed="1.25">1.25x</button>
                        <button class="speed-btn" data-speed="1.5">1.5x</button>
                        <button class="speed-btn" data-speed="2">2x</button>
                        <button class="speed-btn" data-speed="3">3x</button>
                        <button class="speed-btn" data-speed="4">4x</button>
                        <button class="speed-btn" data-speed="5">5x</button>
                        <button class="speed-btn" data-speed="6">6x</button>
                        <button class="speed-btn" data-speed="7">7x</button>
                        <button class="speed-btn" data-speed="8">8x</button>
                        <button class="speed-btn" data-speed="10">10x</button>
                    </div>
                    <div class="custom-speed">
                        <input type="range" class="speed-slider" min="0.25" max="10" step="0.25" value="1">
                        <span class="speed-value">1.0x</span>
                    </div>
                </div>

                <div class="control-group">
                    <h5>📂 Local Playlist</h5>
                    <div class="playlist"></div>
                    <div class="playlist-controls">
                        <button class="prev-video-btn">⏮️ Previous</button>
                        <button class="next-video-btn">⏭️ Next</button>
                        <button class="shuffle-btn">🔀 Shuffle</button>
                    </div>
                </div>
            </div>

            <div class="video-info">
                <p>No video loaded in Player ${this.id}</p>
            </div>
        `;

        this.container.appendChild(this.element);
        this.initializeElements();
    }

    initializeElements() {
        this.video = this.element.querySelector('.video-element');
        this.videoSource = this.element.querySelector('.video-source');
        this.fileInput = this.element.querySelector('.file-input');
        this.speedDisplay = this.element.querySelector('.video-overlay');
        this.playlistContainer = this.element.querySelector('.playlist');
        this.videoInfo = this.element.querySelector('.video-info');

        // Controls
        this.playPauseBtn = this.element.querySelector('.play-pause-btn');
        this.skipBackBtn = this.element.querySelector('.skip-back-btn');
        this.skipForwardBtn = this.element.querySelector('.skip-forward-btn');
        this.restartBtn = this.element.querySelector('.restart-btn');
        this.speedButtons = this.element.querySelectorAll('.speed-btn');
        this.speedSlider = this.element.querySelector('.speed-slider');
        this.speedValue = this.element.querySelector('.speed-value');
        this.prevVideoBtn = this.element.querySelector('.prev-video-btn');
        this.nextVideoBtn = this.element.querySelector('.next-video-btn');
        this.shuffleBtn = this.element.querySelector('.shuffle-btn');
    }

    setupEventListeners() {
        // File input
        this.fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        
        // File input label click
        const fileLabel = this.element.querySelector('.file-input-label');
        if (fileLabel) {
            fileLabel.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setActive(); // Make this player active when selecting files
                console.log(`File selection for Player ${this.id}`);
            });
        }

        // Make player active when clicked (prevent event bubbling)
        this.element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setActive();
        });

        // Playback controls (prevent event bubbling)
        this.playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePlayPause();
        });
        this.skipBackBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.skipSeconds(-10);
        });
        this.skipForwardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.skipSeconds(10);
        });
        this.restartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.restartVideo();
        });

        // Speed controls (prevent event bubbling)
        this.speedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setSpeed(parseFloat(e.target.dataset.speed));
            });
        });
        this.speedSlider.addEventListener('input', (e) => {
            e.stopPropagation();
            this.setSpeed(parseFloat(e.target.value));
        });

        // Playlist controls (prevent event bubbling)
        this.prevVideoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.playPreviousVideo();
        });
        this.nextVideoBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.playNextVideo();
        });
        this.shuffleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleShuffle();
        });

        // Video events
        this.video.addEventListener('loadedmetadata', () => this.updateVideoInfo());
        this.video.addEventListener('ended', () => this.playNextVideo());
        this.video.addEventListener('error', (e) => this.handleVideoError(e));
        this.video.addEventListener('play', () => this.updatePerformanceStats());
        this.video.addEventListener('pause', () => this.updatePerformanceStats());
        this.video.addEventListener('canplaythrough', () => {
            // Enable autoplay for subsequent videos
            this.video.setAttribute('autoplay', '');
        });

        // Double click for fullscreen (prevent event bubbling)
        this.video.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.toggleFullscreen();
        });

        // Prevent video from pausing other videos
        this.video.addEventListener('play', () => {
            // Don't pause other videos when this one starts
            console.log(`Player ${this.id} started playing`);
        });
    }

    setActive() {
        // Remove active class from all players
        document.querySelectorAll('.video-player-instance').forEach(player => {
            player.classList.remove('active');
        });
        
        // Add active class to this player
        this.element.classList.add('active');
        this.isActive = true;
        
        // Update other players' active status
        if (window.videoPlayerManager) {
            window.videoPlayerManager.players.forEach(player => {
                player.isActive = (player.id === this.id);
            });
        }
        
        // Show visual feedback
        this.showSpeedDisplay(`Player ${this.id} Active`, 1500);
        
        // Update the header to show which player is active
        const header = this.element.querySelector('.player-header h4');
        if (header) {
            header.innerHTML = `🎬 Player ${this.id} <span style="color: #2ed573; font-size: 0.8em;">(ACTIVE)</span>`;
        }
        
        // Remove active indicators from other players
        document.querySelectorAll('.video-player-instance:not(.active) .player-header h4').forEach(h4 => {
            h4.innerHTML = h4.innerHTML.replace(/ <span.*?<\/span>/, '');
        });
        
        console.log(`Player ${this.id} is now active`);
    }

    async handleFileSelection(event) {
        const files = Array.from(event.target.files);
        await this.validateAndAddFiles(files);
    }

    async validateAndAddFiles(files) {
        const validFiles = [];
        const problemFiles = [];
        
        for (const file of files) {
            if (this.isVideoFile(file)) {
                if (file.size === 0) {
                    problemFiles.push({
                        name: file.name,
                        issue: 'File is empty (0 bytes) - likely corrupted'
                    });
                } else if (file.size < 1024) {
                    problemFiles.push({
                        name: file.name,
                        issue: 'File too small (< 1KB) - likely corrupted'
                    });
                } else {
                    try {
                        const chunk = file.slice(0, 1024);
                        await this.readFileChunk(chunk);
                        validFiles.push(file);
                    } catch (error) {
                        problemFiles.push({
                            name: file.name,
                            issue: 'Cannot read file - may be corrupted or inaccessible'
                        });
                    }
                }
            }
        }

        if (problemFiles.length > 0) {
            this.showFileProblems(problemFiles);
        }

        if (validFiles.length === 0) {
            alert(`No valid video files found for Player ${this.id}. Please check your files and try again.`);
            return;
        }

        // Add to existing playlist or create new
        this.playlist = [...this.playlist, ...validFiles];
        if (this.currentVideoIndex === 0 && this.playlist.length === validFiles.length) {
            this.currentVideoIndex = 0;
        }
        
        this.updatePlaylist();
        
        if (!this.video.src || this.video.currentTime === 0) {
            this.loadVideo(this.playlist[this.currentVideoIndex]);
        }
        
        this.showSpeedDisplay(`${validFiles.length} video(s) added! Total: ${this.playlist.length}`);
        window.videoPlayerManager.updateMasterPlaylist();
    }

    readFileChunk(chunk) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(chunk);
        });
    }

    showFileProblems(problemFiles) {
        let message = `⚠️ PROBLEMATIC FILES FOUND in Player ${this.id}:\n\n`;
        problemFiles.forEach(file => {
            message += `❌ ${file.name}\n   Issue: ${file.issue}\n\n`;
        });
        message += '🔧 SOLUTIONS:\n';
        message += '1. Re-copy the file from original source\n';
        message += '2. Check your pendrive for errors\n';
        message += '3. Try a different file format\n';
        message += '4. Scan pendrive with Disk Utility';
        
        alert(message);
    }

    isVideoFile(file) {
        const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska'];
        return videoTypes.includes(file.type) || /\.(mp4|mov|avi|mkv)$/i.test(file.name);
    }

    loadVideo(file) {
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        this.videoSource.src = url;
        
        // Set up video for better multi-player support
        this.video.preload = 'metadata';
        this.video.controls = true;
        
        this.video.load();
        
        this.video.currentFile = file;
        this.updateActivePlaylistItem();
        
        if (this.video.previousURL) {
            URL.revokeObjectURL(this.video.previousURL);
        }
        this.video.previousURL = url;
        
        // Show loading status
        this.showSpeedDisplay(`Loading: ${file.name}`, 2000);
        
        // Set up ready state listener
        this.video.addEventListener('canplaythrough', () => {
            this.showSpeedDisplay(`Ready: Player ${this.id}`, 1500);
        }, { once: true });
        
        // Update master playlist
        if (window.videoPlayerManager) {
            window.videoPlayerManager.updateMasterPlaylist();
        }
    }

    updatePlaylist() {
        this.playlistContainer.innerHTML = '';
        
        this.playlist.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            
            const statusIcon = file.size > 0 ? '✅' : '❌';
            const sizeInfo = file.size > 0 ? this.formatFileSize(file.size) : 'CORRUPTED';
            
            item.innerHTML = `
                <span class="filename" title="${file.name}">${statusIcon} ${file.name}</span>
                <span class="duration ${file.size === 0 ? 'error' : ''}">${sizeInfo}</span>
            `;
            
            item.addEventListener('click', () => {
                if (file.size === 0) {
                    alert(`Cannot play ${file.name} - file is corrupted or empty`);
                    return;
                }
                this.currentVideoIndex = index;
                this.loadVideo(file);
            });
            
            this.playlistContainer.appendChild(item);
        });
    }

    updateActivePlaylistItem() {
        const items = this.playlistContainer.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentVideoIndex);
        });
    }

    togglePlayPause() {
        if (this.video.paused) {
            // Set the video as user-initiated to help with autoplay policies
            this.video.muted = false; // Ensure not muted for better autoplay support
            
            // Try to play the video
            const playPromise = this.video.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.showSpeedDisplay(`Player ${this.id} Playing`, 1000);
                    console.log(`Player ${this.id} started successfully`);
                }).catch(error => {
                    console.error(`Play failed for Player ${this.id}:`, error);
                    
                    // Handle autoplay restrictions
                    if (error.name === 'NotAllowedError') {
                        this.showSpeedDisplay('Click to allow autoplay', 3000);
                        // Try muted playback as fallback
                        this.video.muted = true;
                        this.video.play().catch(e => {
                            this.showSpeedDisplay('Manual interaction required', 3000);
                        });
                    } else {
                        this.showSpeedDisplay('Play failed - check file', 3000);
                    }
                });
            }
        } else {
            this.video.pause();
            this.showSpeedDisplay(`Player ${this.id} Paused`, 1000);
        }
    }

    skipSeconds(seconds) {
        this.video.currentTime = Math.max(0, Math.min(this.video.duration || 0, this.video.currentTime + seconds));
        this.showSpeedDisplay(`${seconds > 0 ? '+' : ''}${seconds}s`);
    }

    restartVideo() {
        this.video.currentTime = 0;
        this.showSpeedDisplay('Restarted');
    }

    setSpeed(speed) {
        this.video.playbackRate = speed;
        this.speedValue.textContent = `${speed}x`;
        this.speedSlider.value = speed;
        
        this.speedButtons.forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
        });
        
        this.showSpeedDisplay(`${speed}x Speed`);
        
        this.video.classList.add('speed-change-animation');
        setTimeout(() => this.video.classList.remove('speed-change-animation'), 300);
    }

    playNextVideo() {
        if (this.playlist.length === 0) return;
        
        if (this.isShuffled) {
            const currentShuffledIndex = this.shuffledPlaylist.indexOf(this.currentVideoIndex);
            const nextShuffledIndex = (currentShuffledIndex + 1) % this.shuffledPlaylist.length;
            this.currentVideoIndex = this.shuffledPlaylist[nextShuffledIndex];
        } else {
            this.currentVideoIndex = (this.currentVideoIndex + 1) % this.playlist.length;
        }
        
        this.loadVideo(this.playlist[this.currentVideoIndex]);
        this.video.play().catch(error => console.error('Auto-play failed:', error));
    }

    playPreviousVideo() {
        if (this.playlist.length === 0) return;
        
        if (this.isShuffled) {
            const currentShuffledIndex = this.shuffledPlaylist.indexOf(this.currentVideoIndex);
            const prevShuffledIndex = currentShuffledIndex === 0 ? 
                this.shuffledPlaylist.length - 1 : currentShuffledIndex - 1;
            this.currentVideoIndex = this.shuffledPlaylist[prevShuffledIndex];
        } else {
            this.currentVideoIndex = this.currentVideoIndex === 0 ? 
                this.playlist.length - 1 : this.currentVideoIndex - 1;
        }
        
        this.loadVideo(this.playlist[this.currentVideoIndex]);
        this.video.play().catch(error => console.error('Auto-play failed:', error));
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        
        if (this.isShuffled) {
            this.shufflePlaylist();
            this.shuffleBtn.style.background = 'linear-gradient(135deg, #00d4ff, #0099cc)';
            this.showSpeedDisplay('Shuffle ON');
        } else {
            this.shuffleBtn.style.background = '';
            this.showSpeedDisplay('Shuffle OFF');
        }
    }

    shufflePlaylist() {
        this.shuffledPlaylist = [...Array(this.playlist.length).keys()];
        
        for (let i = this.shuffledPlaylist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledPlaylist[i], this.shuffledPlaylist[j]] = 
            [this.shuffledPlaylist[j], this.shuffledPlaylist[i]];
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.video.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    showSpeedDisplay(text, duration = 2000) {
        this.speedDisplay.textContent = text;
        this.speedDisplay.classList.add('show');
        
        clearTimeout(this.speedDisplayTimeout);
        this.speedDisplayTimeout = setTimeout(() => {
            this.speedDisplay.classList.remove('show');
        }, duration);
    }

    updateVideoInfo() {
        if (!this.video.currentFile) {
            this.videoInfo.innerHTML = `<p>No video loaded in Player ${this.id}</p>`;
            return;
        }

        const file = this.video.currentFile;
        const duration = this.formatTime(this.video.duration);
        const resolution = `${this.video.videoWidth}x${this.video.videoHeight}`;
        const fileSize = this.formatFileSize(file.size);
        const healthStatus = file.size > 0 ? '✅ Healthy' : '❌ Corrupted';
        
        this.videoInfo.innerHTML = `
            <p><strong>Player ${this.id}</strong></p>
            <p><span class="highlight">File:</span> ${file.name}</p>
            <p><span class="highlight">Status:</span> ${healthStatus}</p>
            <p><span class="highlight">Duration:</span> ${duration}</p>
            <p><span class="highlight">Resolution:</span> ${resolution}</p>
            <p><span class="highlight">Size:</span> ${fileSize}</p>
        `;
    }

    handleVideoError(event) {
        console.error('Video error in Player', this.id, ':', event);
        const error = this.video.error;
        let errorMessage = 'Unknown error';
        
        if (error) {
            switch (error.code) {
                case 1: errorMessage = 'Video loading aborted'; break;
                case 2: errorMessage = 'Network error - check file source'; break;
                case 3: errorMessage = 'Video decode error - file may be corrupted'; break;
                case 4: errorMessage = 'Video format not supported'; break;
                default: errorMessage = `Error code: ${error.code}`;
            }
        }
        
        this.showSpeedDisplay(`Error: ${errorMessage}`, 5000);
        
        const detailedMessage = `❌ VIDEO PLAYBACK ERROR - Player ${this.id}\n\n` +
            `File: ${this.video.currentFile?.name || 'Unknown'}\n` +
            `Error: ${errorMessage}\n\n` +
            `🔧 SOLUTIONS:\n` +
            `1. File may be corrupted - try re-copying from source\n` +
            `2. Check if file shows "Zero bytes on disk" in file info\n` +
            `3. Try converting to a different format\n` +
            `4. Scan your pendrive for errors\n` +
            `5. Try playing in QuickTime Player first`;
            
        alert(detailedMessage);
    }

    updatePerformanceStats() {
        if (window.videoPlayerManager) {
            window.videoPlayerManager.updatePerformanceStats();
        }
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    destroy() {
        if (this.video.previousURL) {
            URL.revokeObjectURL(this.video.previousURL);
        }
        this.element.remove();
    }
}

class VideoPlayerManager {
    constructor() {
        this.players = [];
        this.nextPlayerId = 1;
        this.masterPlaylist = [];
        
        this.initializeElements();
        this.setupGlobalEventListeners();
        this.setupKeyboardShortcuts();
        this.createFirstPlayer();
    }

    initializeElements() {
        this.container = document.getElementById('videoPlayersContainer');
        this.playerCount = document.getElementById('playerCount');
        this.masterPlaylistContainer = document.getElementById('masterPlaylist');
        
        // Global controls
        this.addPlayerBtn = document.getElementById('addPlayerBtn');
        this.addMoreVideosBtn = document.getElementById('addMoreVideosBtn');
        this.syncAllBtn = document.getElementById('syncAllBtn');
        this.pauseAllBtn = document.getElementById('pauseAllBtn');
        this.playAllBtn = document.getElementById('playAllBtn');
        
        this.globalSpeedButtons = document.querySelectorAll('.global-speed-btn');
        this.globalSpeedSlider = document.getElementById('globalSpeedSlider');
        this.globalSpeedValue = document.getElementById('globalSpeedValue');
        this.applyGlobalSpeedBtn = document.getElementById('applyGlobalSpeedBtn');
        
        this.shuffleAllBtn = document.getElementById('shuffleAllBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.exportPlaylistBtn = document.getElementById('exportPlaylistBtn');
        this.importPlaylistBtn = document.getElementById('importPlaylistBtn');
        
        // Performance stats
        this.totalPlayersSpan = document.getElementById('totalPlayers');
        this.activeVideosSpan = document.getElementById('activeVideos');
        this.memoryUsageSpan = document.getElementById('memoryUsage');
        this.cpuLoadSpan = document.getElementById('cpuLoad');
    }

    setupGlobalEventListeners() {
        this.addPlayerBtn.addEventListener('click', () => this.addPlayer());
        this.addMoreVideosBtn.addEventListener('click', () => this.addMoreVideos());
        this.syncAllBtn.addEventListener('click', () => this.syncAllPlayers());
        this.pauseAllBtn.addEventListener('click', () => this.pauseAllPlayers());
        this.playAllBtn.addEventListener('click', () => this.playAllPlayers());
        
        this.globalSpeedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setGlobalSpeed(parseFloat(e.target.dataset.speed)));
        });
        this.globalSpeedSlider.addEventListener('input', (e) => this.updateGlobalSpeedValue(parseFloat(e.target.value)));
        this.applyGlobalSpeedBtn.addEventListener('click', () => this.applyGlobalSpeed());
        
        this.shuffleAllBtn.addEventListener('click', () => this.shuffleAllPlayers());
        this.clearAllBtn.addEventListener('click', () => this.clearAllPlayers());
        this.exportPlaylistBtn.addEventListener('click', () => this.exportPlaylist());
        this.importPlaylistBtn.addEventListener('click', () => this.importPlaylist());
        
        // Handle player removal
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-player-btn')) {
                const playerId = parseInt(e.target.dataset.playerId);
                this.removePlayer(playerId);
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }
            
            const activePlayer = this.getActivePlayer();
            
            // Global shortcuts (with Ctrl)
            if (e.ctrlKey) {
                switch (e.code) {
                    case 'KeyA':
                        e.preventDefault();
                        this.toggleAllPlayers();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.skipAllPlayers(10);
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.skipAllPlayers(-10);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.adjustAllSpeeds(0.25);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.adjustAllSpeeds(-0.25);
                        break;
                    case 'KeyN':
                        e.preventDefault();
                        this.addPlayer();
                        break;
                }
                return;
            }
            
            // Player selection shortcuts
            if (e.code >= 'Digit1' && e.code <= 'Digit9') {
                e.preventDefault();
                const playerIndex = parseInt(e.code.replace('Digit', '')) - 1;
                if (this.players[playerIndex]) {
                    this.players[playerIndex].setActive();
                    this.players[playerIndex].showSpeedDisplay(`Player ${this.players[playerIndex].id} Active`, 1500);
                }
                return;
            }
            
            // Active player shortcuts
            if (!activePlayer) {
                console.log('No active player selected. Click on a player first or press 1-9 to select.');
                return;
            }
            
            // Prevent default for known shortcuts
            if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyR', 'KeyF', 'KeyM', 'Delete'].includes(e.code)) {
                e.preventDefault();
            }

            switch (e.code) {
                case 'Space':
                    console.log(`Space pressed - toggling Player ${activePlayer.id}`);
                    activePlayer.togglePlayPause();
                    break;
                case 'ArrowRight':
                    activePlayer.skipSeconds(10);
                    break;
                case 'ArrowLeft':
                    activePlayer.skipSeconds(-10);
                    break;
                case 'ArrowUp':
                    const currentSpeed = activePlayer.video.playbackRate;
                    activePlayer.setSpeed(Math.min(10, currentSpeed + 0.25));
                    break;
                case 'ArrowDown':
                    const currentSpeed2 = activePlayer.video.playbackRate;
                    activePlayer.setSpeed(Math.max(0.25, currentSpeed2 - 0.25));
                    break;
                case 'KeyR':
                    activePlayer.restartVideo();
                    break;
                case 'KeyF':
                    activePlayer.toggleFullscreen();
                    break;
                case 'KeyM':
                    activePlayer.video.muted = !activePlayer.video.muted;
                    activePlayer.showSpeedDisplay(activePlayer.video.muted ? 'Muted' : 'Unmuted');
                    break;
                case 'Delete':
                    this.removePlayer(activePlayer.id);
                    break;
            }
        });
    }

    createFirstPlayer() {
        this.addPlayer();
        // Make sure the first player is active
        if (this.players.length === 1) {
            this.players[0].setActive();
        }
    }

    addPlayer() {
        if (this.players.length >= 9) {
            alert('Maximum 9 players allowed for optimal performance!');
            return;
        }
        
        const player = new VideoPlayer(this.nextPlayerId, this.container);
        this.players.push(player);
        this.nextPlayerId++;
        
        // Make the new player active
        player.setActive();
        
        this.updatePlayerCount();
        this.updatePerformanceStats();
    }

    removePlayer(playerId) {
        if (this.players.length <= 1) {
            alert('Cannot remove the last player!');
            return;
        }
        
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            this.players[playerIndex].destroy();
            this.players.splice(playerIndex, 1);
            
            // If removed player was active, make first player active
            if (!this.getActivePlayer() && this.players.length > 0) {
                this.players[0].setActive();
            }
            
            this.updatePlayerCount();
            this.updateMasterPlaylist();
            this.updatePerformanceStats();
        }
    }

    getActivePlayer() {
        return this.players.find(player => player.isActive);
    }

    addMoreVideos() {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer) {
            alert('No active player selected. Click on a player to select it first.');
            return;
        }
        
        console.log(`Adding more videos to Player ${activePlayer.id}`);
        activePlayer.showSpeedDisplay(`Adding videos to Player ${activePlayer.id}`, 2000);
        
        // Create a new file input specifically for this action
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.mp4,.mov,.avi,.mkv';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                console.log(`Selected ${e.target.files.length} files for Player ${activePlayer.id}`);
                await activePlayer.validateAndAddFiles(Array.from(e.target.files));
            }
            fileInput.remove(); // Clean up
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
    }

    updatePlayerCount() {
        this.playerCount.textContent = `Active Players: ${this.players.length}`;
        this.totalPlayersSpan.textContent = this.players.length;
    }

    setGlobalSpeed(speed) {
        this.globalSpeedValue.textContent = `${speed}x`;
        this.globalSpeedSlider.value = speed;
        
        this.globalSpeedButtons.forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
        });
    }

    updateGlobalSpeedValue(speed) {
        this.globalSpeedValue.textContent = `${speed}x`;
    }

    applyGlobalSpeed() {
        const speed = parseFloat(this.globalSpeedSlider.value);
        this.players.forEach(player => {
            player.setSpeed(speed);
        });
    }

    toggleAllPlayers() {
        const anyPlaying = this.players.some(player => !player.video.paused && player.video.src);
        
        if (anyPlaying) {
            // Pause all playing videos
            this.pauseAllPlayers();
        } else {
            // Play all videos that have content
            this.playAllPlayers();
        }
    }

    playAllPlayers() {
        let successCount = 0;
        let totalPlayers = this.players.length;
        
        this.players.forEach((player, index) => {
            if (player.video.src && player.video.readyState >= 2) {
                // Set up for better autoplay support
                player.video.muted = false;
                
                const playPromise = player.video.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        successCount++;
                        console.log(`Player ${player.id} started successfully`);
                        if (successCount === 1) {
                            player.showSpeedDisplay(`Playing ${successCount}/${totalPlayers} players`, 2000);
                        }
                    }).catch(error => {
                        console.error(`Play failed for Player ${player.id}:`, error);
                        
                        // Fallback to muted playback
                        if (error.name === 'NotAllowedError') {
                            player.video.muted = true;
                            player.video.play().catch(e => {
                                player.showSpeedDisplay('Manual click required', 2000);
                            });
                        }
                    });
                }
            } else {
                console.log(`Player ${player.id} has no video loaded or not ready`);
            }
        });
        
        setTimeout(() => {
            if (successCount > 0) {
                console.log(`Successfully started ${successCount}/${totalPlayers} players`);
            }
        }, 1000);
    }

    pauseAllPlayers() {
        this.players.forEach(player => {
            if (!player.video.paused) {
                player.video.pause();
                player.showSpeedDisplay(`Player ${player.id} Paused`, 1000);
            }
        });
    }

    skipAllPlayers(seconds) {
        this.players.forEach(player => {
            player.skipSeconds(seconds);
        });
    }

    adjustAllSpeeds(increment) {
        this.players.forEach(player => {
            const currentSpeed = player.video.playbackRate;
            const newSpeed = Math.max(0.25, Math.min(10, currentSpeed + increment));
            player.setSpeed(newSpeed);
        });
    }

    syncAllPlayers() {
        const activePlayer = this.getActivePlayer();
        if (!activePlayer) {
            alert('No active player to sync to. Select a player first.');
            return;
        }
        
        const targetTime = activePlayer.video.currentTime;
        const targetSpeed = activePlayer.video.playbackRate;
        
        this.players.forEach(player => {
            if (player !== activePlayer && player.video.duration) {
                player.video.currentTime = Math.min(targetTime, player.video.duration);
                player.setSpeed(targetSpeed);
            }
        });
        
        activePlayer.showSpeedDisplay('All players synced!');
    }

    shuffleAllPlayers() {
        this.players.forEach(player => {
            if (player.playlist.length > 0) {
                player.toggleShuffle();
            }
        });
    }

    clearAllPlayers() {
        if (confirm('Clear all playlists? This cannot be undone.')) {
            this.players.forEach(player => {
                player.playlist = [];
                player.currentVideoIndex = 0;
                player.video.src = '';
                player.updatePlaylist();
                player.updateVideoInfo();
            });
            this.updateMasterPlaylist();
        }
    }

    updateMasterPlaylist() {
        this.masterPlaylistContainer.innerHTML = '';
        this.masterPlaylist = [];
        
        this.players.forEach(player => {
            player.playlist.forEach(file => {
                if (!this.masterPlaylist.some(item => item.file.name === file.name && item.file.size === file.size)) {
                    this.masterPlaylist.push({
                        file: file,
                        playerId: player.id
                    });
                }
            });
        });
        
        this.masterPlaylist.forEach(item => {
            const element = document.createElement('div');
            element.className = 'master-playlist-item';
            element.innerHTML = `
                <span class="filename">${item.file.name}</span>
                <span class="player-id">Player ${item.playerId}</span>
                <span class="file-size">${this.formatFileSize(item.file.size)}</span>
            `;
            this.masterPlaylistContainer.appendChild(element);
        });
    }

    updatePerformanceStats() {
        const activeVideos = this.players.filter(player => !player.video.paused).length;
        this.activeVideosSpan.textContent = activeVideos;
        
        // Estimate memory usage (rough calculation)
        const totalVideos = this.players.reduce((sum, player) => sum + player.playlist.length, 0);
        const estimatedMemory = totalVideos * 2 + activeVideos * 50; // MB estimate
        this.memoryUsageSpan.textContent = `~${estimatedMemory}MB`;
        
        // CPU load estimate
        const cpuLoad = activeVideos * 10 + this.players.length * 2;
        this.cpuLoadSpan.textContent = `~${Math.min(cpuLoad, 100)}%`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    exportPlaylist() {
        const playlistData = {
            players: this.players.map(player => ({
                id: player.id,
                playlist: player.playlist.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type
                }))
            })),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(playlistData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video-playlist-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importPlaylist() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        console.log('Imported playlist data:', data);
                        alert('Playlist structure imported! You\'ll need to reload the actual video files.');
                    } catch (error) {
                        alert('Error importing playlist: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
}

// Initialize the video player manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.videoPlayerManager = new VideoPlayerManager();
    
    // Add user interaction to enable autoplay
    document.addEventListener('click', enableAutoplay, { once: true });
    document.addEventListener('keydown', enableAutoplay, { once: true });
    
    // Ensure document can receive keyboard events
    document.body.tabIndex = 0;
    document.body.focus();
    
    // Detect platform and show appropriate tips
    const platform = navigator.platform.toLowerCase();
    const isWindows = platform.includes('win');
    const isMac = platform.includes('mac');
    const browser = navigator.userAgent;
    
    // Update platform info in UI
    const platformInfo = document.getElementById('platformInfo');
    const platformText = document.getElementById('platformText');
    
    if (isWindows) {
        platformInfo.classList.add('windows');
        platformText.textContent = '🪟 Windows Detected • Chrome/Firefox recommended • .mp4/.avi/.mkv supported';
    } else if (isMac) {
        platformInfo.classList.add('macos');
        platformText.textContent = '🍎 macOS Detected • Safari optimized • .mp4/.mov natively supported';
    } else {
        platformText.textContent = '🌐 Cross-platform compatible • Works on Windows & macOS';
    }
    
    console.log('🎬 Advanced Multi-Video Player loaded successfully!');
    console.log(`📱 Platform: ${isWindows ? 'Windows' : isMac ? 'macOS' : 'Other'}`);
    console.log(`🌐 Browser: ${browser.includes('Chrome') ? 'Chrome' : browser.includes('Firefox') ? 'Firefox' : browser.includes('Safari') ? 'Safari' : 'Other'}`);
    
    if (isWindows) {
        console.log('🪟 Windows optimizations: Use Chrome/Firefox for best performance');
        console.log('📁 Best formats: .mp4, .avi, .mkv');
    } else if (isMac) {
        console.log('🍎 macOS optimizations: Safari excellent, Chrome for heavy usage');
        console.log('📁 Best formats: .mp4, .mov (native support)');
    }
    
    console.log('💡 Pro tips:');
    console.log('   - Use Ctrl+A to play/pause all videos (both Windows & macOS)');
    console.log('   - Press 1-9 to switch between players');
    console.log('   - Use SPACE to play/pause active player');
    console.log('   - Speed now goes up to 10x!');
    console.log('   - Add multiple players for simultaneous playback');
    console.log('   - Click anywhere to enable simultaneous video playback');
    console.log('   - Click on a player to make it active (blue border)');
});

// Function to enable autoplay after user interaction
function enableAutoplay() {
    document.body.classList.add('user-interacted');
    console.log('User interaction detected - simultaneous video playback enabled!');
    
    // Hide the interaction notice
    const notice = document.getElementById('userInteractionNotice');
    if (notice) {
        notice.style.display = 'none';
    }
    
    // Show a brief notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2ed573, #26d466);
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 5px 15px rgba(46, 213, 115, 0.3);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = '✅ Multi-video playback enabled!';
    
    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Handle page unload to clean up resources
window.addEventListener('beforeunload', () => {
    if (window.videoPlayerManager) {
        window.videoPlayerManager.players.forEach(player => {
            if (player.video && player.video.previousURL) {
                URL.revokeObjectURL(player.video.previousURL);
            }
        });
    }
}); 