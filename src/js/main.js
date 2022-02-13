const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class tanks {
	constructor(x, y, w, h, rotation) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.rotation = rotation;
		this.speed = 2.5;
		this.color = "#0095DD";
		this.image = new Image();
		this.imageFrame = 0;
		this.time_collums = 3;
		this.collums_value = 5;
	}

	draw() {
		ctx.save();
		ctx.translate(this.x + 100, this.y - 100);
		ctx.rotate(this.rotation);
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.w, this.h);
		ctx.restore();
	}

	drawImage() {
		this.image.src = "img/tank.png";
		ctx.save();
		ctx.translate(this.x + 100, this.y - 100);
		ctx.rotate(this.rotation + Math.PI / 2);
		let position =
			Math.floor(this.imageFrame / this.time_collums) % this.collums_value;
		let collums = position * 100;
		ctx.drawImage(this.image, collums, 0, 100, 100, -90, -190, 300, 300);
		ctx.restore();
	}
}

let bullets_array = [];
let players = new tanks(0, 150, 100, 100, 0);
let enemies = [];
let enemies_count = 0;

class bullets {
	constructor(w, h) {
		this.x = players.x;
		this.y = players.y;
		this.w = w;
		this.h = h;
		this.speed = 13;
		this.color = "#AF9B60";
		this.image = new Image();
		this.imageFrame = 0;
		this.time_collums = 3;
		this.collums_value = 5;
		this.rotation = players.rotation;
	}

	draw() {
		ctx.save();
		ctx.translate(this.x + 100, this.y - 100);
		ctx.rotate(this.rotation);
		ctx.fillStyle = this.color;
		ctx.fillRect(100, 45, this.w, this.h);
		ctx.restore();
	}

	// make bullet move
	move() {
		this.x += this.speed * Math.cos(this.rotation);
		this.y += this.speed * Math.sin(this.rotation);
	}
}

class Particles {
	constructor({ position, velocity, radius, color, fades }) {
		this.position = position;
		this.velocity = velocity;

		this.radius = radius;
		this.color = color;
		this.opacity = 1;
		this.fades = fades;
	}

	draw() {
		ctx.save();
		ctx.globalAlpha = this.opacity;
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		if (this.fades) {
			this.opacity -= 0.01;
		}
	}
}

let particles = [];

let fps = 80;
let interval = 1000 / fps;

let controller = {
	up: false,
	down: false,
	left: false,
	right: false,
};

addEventListener("keydown", function (e) {
	switch (e.keyCode) {
		case (38, 87):
			controller.up = true;
			break;
		case (40, 83):
			controller.down = true;
			break;
		case (37, 65):
			controller.left = true;
			break;
		case (39, 68):
			controller.right = true;
			break;
	}
});

let shootCoolDown = 0;
addEventListener("keypress", function (e) {
	// make it can't be shoot after 5 seconds
	if (e.keyCode == 32 && shootCoolDown <= 0) {
		let bullet = new bullets(8, 8);
		bullets_array.push(bullet);
		shootCoolDown = 5;
	} else {
		if (shootCoolDown > 0) {
			shootCoolDown--;
		}
	}
});

addEventListener("keyup", () => {
	controller.up = false;
	controller.down = false;
	controller.left = false;
	controller.right = false;
});

function spawner() {
    requestAnimationFrame(spawner);
        if (enemies_count < 10) {
        enemies_count++;
            // make the enemy spawn from right side
        let enemy = new tanks(canvas.width, Math.random() * canvas.height, 100, 100, Math.PI);
        enemies.push(enemy);
    }
}

spawner();

let enemyShootCoolDown = 0;

function update() {
	requestAnimationFrame(update);
	ctx.clearRect(0, 0, canvas.width, canvas.height);

    enemies.forEach((enemy, index) => {
        enemy.drawImage();

        // make the enemy bot like a tank and move randomly
        if (enemy.x > canvas.width / 2) {
            enemy.x -= enemy.speed;
        } else {
            enemy.x += enemy.speed;
        }
        
        if (enemy.x > canvas.width - 100) {
            enemy.x -= enemy.speed;
            enemy.rotation -= 0.1;
        }
        if (enemy.x < 0) {
            enemy.x += enemy.speed;
            enemy.rotation += 0.1;
        }
        if (enemy.y > canvas.height - 100) {
            enemy.y -= enemy.speed;
            enemy.rotation -= 0.1;
        }

        if (enemy.y < 0) {
            enemy.y += enemy.speed;
            enemy.rotation += 0.1;
            enemy.imageFrame++
        }

        // make the enemy move randomly
        if (Math.random() > 0.5) {
            enemy.x += enemy.speed;
            enemy.imageFrame++
        } else {
            enemy.x -= enemy.speed;
            enemy.imageFrame++
        }

        if (Math.random() > 0.5) {
            enemy.y += enemy.speed;
            enemy.imageFrame++;
        }
        else {
            enemy.y -= enemy.speed;
            enemy.imageFrame++
        }

        // make the enemy shoot
        if (Math.floor(Math.random() * 100) > 50 && enemyShootCoolDown <= 0) {
            enemyShootCoolDown = 25;
            let bullet = new bullets(8, 8);
            bullet.x = enemy.x;
            bullet.y = enemy.y;
            bullet.rotation = enemy.rotation;
            bullets_array.push(bullet);
        } else {
            if (enemyShootCoolDown > 0) {
                enemyShootCoolDown-=0.5;
            }
        }

        // if we shoot the enemy we make the enemy die
        bullets_array.forEach((bullet, index) => {
            if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.w && bullet.y > enemy.y && bullet.y < enemy.y + enemy.h) {
                setTimeout(() => {
                enemy.alive = false;
                    enemies.splice(index, 1);
                    bullets_array.splice(index, 1);
                    enemy.imageFrame = 0;

                // make the enemy die and make the explosion
                for (let i = 0; i < 100; i++) {
                    let particle = new Particles({
                        position: {
                            x: enemy.x + enemy.w / 2,
                            y: enemy.y + enemy.h / 2
                        },
                        velocity: {
                            x: Math.random() * 10 - 5,
                            y: Math.random() * 10 - 5
                        },
                        radius: Math.random() * 5,
                        color: "white",
                        fades: true
                    });
                    particles.push(particle);
                }
            }, 0);
            } else {
                enemy.imageFrame++
            }

            // make the enemy die
            // if the enemy bullet hit the player
            if (bullet.x > players.x && bullet.x < players.x + players.w && bullet.y > players.y && bullet.y < players.y + players.h) {
                setTimeout(() => {
                    alert("YOU MOTHERFUCKING LOSE!")
                    bullets_array.splice(index, 1);
                    enemy.imageFrame = 0;

                    // make the explosion
                    for (let i = 0; i < 100; i++) {
                        let particle = new Particles({
                            position: {
                                x: players.x + players.w / 2,
                                y: players.y + players.h / 2
                            },
                            velocity: {
                                x: Math.random() * 10 - 5,
                                y: Math.random() * 10 - 5
                            },
                            radius: Math.random() * 5,
                            color: "white",
                            fades: true
                        });
                        particles.push(particle);
                    }
                }, 0);
            }
        });
    });

	bullets_array.forEach((bullet) => {
		bullet.draw();
		bullet.move();

		if (
			bullet.x > canvas.width - 30 ||
			bullet.x < 0 ||
			bullet.y > canvas.height - 30 ||
			bullet.y < 0
		) {
			// add some particles
			for (let i = 0; i < 10; i++) {
				let particle = new Particles({
					position: {
						x: bullet.x,
						y: bullet.y,
					},
					velocity: {
						x: (Math.random() - 0.5) * 10,
						y: (Math.random() - 0.5) * 10,
					},
					radius: Math.random() * 2 + 1,
					color: "#E25822",
					fades: true,
				});

				particles.push(particle);
			}
			bullets_array.splice(bullets_array.indexOf(bullet), 1);
		}
	});

	particles.forEach((particle) => {
		particle.update();

		if (particle.opacity <= 0) {
			particles.splice(particles.indexOf(particle), 1);
		}
	});

	players.drawImage();

	// if the rotation range is not go out of the canvas
	if (players.y - players.h / 2 < 0) {
		players.y = players.h / 2;
	}

	if (controller.left) {
		players.rotation -= 0.02;
		players.imageFrame++;
	}

	if (controller.right) {
		players.rotation += 0.02;
		players.imageFrame++;
	}

	if (controller.up && players.y - players.h / 2 > 0) {
		players.x += Math.cos(players.rotation) * players.speed;
		players.y += Math.sin(players.rotation) * players.speed;
		players.imageFrame++;
	}

	if (
		controller.down &&
		players.y - players.h / 2 > 0 &&
		players.y - players.h / 2 < canvas.height - players.h / 2
	) {
		players.x -= Math.cos(players.rotation) * players.speed;
		players.y -= Math.sin(players.rotation) * players.speed;
		players.imageFrame++;
	}
}

// when the canvas animation is done we call the update function
canvas.addEventListener("animationend", update);
