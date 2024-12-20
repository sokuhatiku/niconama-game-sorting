fs = require('fs');

necessalyFiles = {
    audio: [
        "bgm",
        "pick",
        "put",
        "whistle_start",
        "whistle_finish",
        "ok",
        "ng",
        "count_up",
        "count_finish",
    ]
}

// Audio
dummyM4A = fs.readFileSync('setup/dummy.m4a');
dummyOgg = fs.readFileSync('setup/dummy.ogg');
necessalyFiles.audio.forEach(fileNameWithoutExtension => {
    console.log(`audio/${fileNameWithoutExtension}`);
    fs.writeFileSync(`audio/${fileNameWithoutExtension}.m4a`, dummyM4A);
    fs.writeFileSync(`audio/${fileNameWithoutExtension}.ogg`, dummyOgg);
});
