import random
import json
import math


for x in range(20):
	x = random.randint(2000, 3000)

def gen_dist(n, cr, cx, cy):
	coord = []
	for i in range(n):
		circle_r = cr
		# center of the circle (x, y)
		circle_x = cx
		circle_y = cy

		# random angle
		alpha = 2 * math.pi * random.random()
		# random radius
		r = circle_r * math.sqrt(random.random())
		# calculating coordinates
		x = r * math.cos(alpha) + circle_x
		y = r * math.sin(alpha) + circle_y

		coord.append([x,y])
	
	return coord


def create_block(): 
	point = []

	t = (5 * math.sqrt(2)) - 3

	coord1 = gen_dist(100, 0.25, 0.4, 0.7)
	coord2 = gen_dist(100, 0.25, 0.8, 0.4)
	coord3 = gen_dist(100, 0.25, 0.2, 0.2)

	point.append(coord1)
	point.append(coord2)
	point.append(coord3)
	centers = [[0.4, 0.9], [0.8, 0.2], [0.2, 0.2]]
	full_dict = {}
	spectral = {}
	spectral['points'] = point
	spectral['centroid'] = centers
	full_dict['mickey'] = spectral


	with open('simul2.json', 'w') as json_file:
		json.dump(full_dict, json_file)


