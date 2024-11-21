let bulletPosition = null;
let currentPosition = -1;
let attempts = 0;
let canFire = false;

const audioFiles = {
    spin: new Audio('audio/revolver-spin-96947.mp3'),
    click: new Audio('audio/empty-gun-shot-6209.mp3'),
    shot: new Audio('audio/submachine-gun-79846.mp3')
};

async function preloadAssets() {
    const loadingPromises = [];

    // Preload audio files
    for (const audio of Object.values(audioFiles)) {
        loadingPromises.push(
            new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', reject);
                audio.load();
            })
        );
    }

    // Preload font
    loadingPromises.push(
        document.fonts.load('1em Bokor').then(() => {
            return document.fonts.load('1.5em Bokor');
        }).then(() => {
            return document.fonts.load('3em Bokor');
        }).then(() => {
            return document.fonts.load('4em Bokor');
        })
    );

    try {
        await Promise.all(loadingPromises);
        document.getElementById('loadingScreen').style.display = 'none';
        document.querySelector('.game-container').style.display = 'block';
        initGame();
    } catch (error) {
        console.error('Failed to load assets:', error);
        // Optionally show an error message to the user
    }
}

function initGame() {
    bulletPosition = null;
    currentPosition = -1;
    attempts = 0;
    canFire = false;
    updateStats();
    document.getElementById('spinBtn').disabled = false;
    document.getElementById('triggerBtn').disabled = true;
}

function spin() {
    if (bulletPosition === null) {
        bulletPosition = Math.floor(Math.random() * 6);
        console.log(`Initial spin: Bullet is in position ${bulletPosition}`);
    }
    
    audioFiles.spin.currentTime = 0;
    audioFiles.spin.play();
    
    const cylinder = document.querySelector('.cylinder');
    cylinder.style.transition = 'none';
    cylinder.style.transform = 'rotate(0deg)';
    cylinder.offsetHeight;
    cylinder.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)';
    const rotations = 5 + Math.random() * 5;
    cylinder.style.transform = `rotate(${rotations * 360}deg)`;
    
    document.getElementById('spinBtn').disabled = true;
    document.getElementById('triggerBtn').disabled = false;
    canFire = true;
}

function pullTrigger() {
    if (!canFire) return;
    
    attempts++;
    updateStats();
    
    currentPosition = (currentPosition + 1) % 6;
    
    console.log(`Pull ${attempts}: Checking position ${currentPosition}`);
    console.log(`Current bullet position: ${bulletPosition}`);
    
    if (currentPosition === bulletPosition) {
        console.log('BANG! Found bullet!');
        audioFiles.shot.play();
        document.body.classList.add('shake');
        setTimeout(() => {
            document.getElementById('gameOver').style.display = 'block';
        }, 500);
    } else {
        console.log('Click - empty chamber');
        audioFiles.click.play();
        
        document.getElementById('triggerBtn').disabled = true;
        document.getElementById('spinBtn').disabled = false;
        canFire = false;
        
        if (attempts === 6) {
            console.log('Final chamber check:');
            console.log(`- Current position: ${currentPosition}`);
            console.log(`- Bullet position: ${bulletPosition}`);
            console.log('- Checked positions:', Array.from({length: 6}, (_, i) => i).join(', '));
            
            setTimeout(() => {
                document.getElementById('winner').style.display = 'block';
            }, 500);
        }
    }
}

function updateStats() {
    document.getElementById('attempts').textContent = attempts;
}

document.getElementById('spinBtn').addEventListener('click', spin);
document.getElementById('triggerBtn').addEventListener('click', pullTrigger);
document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOver').style.display = 'none';
    document.body.classList.remove('shake');
    initGame();
});
document.getElementById('newGameBtn').addEventListener('click', () => {
    document.getElementById('winner').style.display = 'none';
    initGame();
});

preloadAssets(); 