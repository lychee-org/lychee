from pymongo import MongoClient
from dist import distance

def is_float_integer(f):
    return f == int(f)

client = MongoClient('mongodb://localhost:27017')
db = client['lychee']
collection = db['old_upd']

cursor = collection.find({})
hierarchy_tags_list = []
for document in cursor:
    hierarchy_tags = document.get('hierarchy_tags')
    if hierarchy_tags is not None:
        hierarchy_tags_list.append(hierarchy_tags)

n = len(hierarchy_tags_list)
print(n)

l, l2 = [], []
l3 = []

ans = 0
for i in range(100):
    for j in range(i):
        d = distance(hierarchy_tags_list[i], hierarchy_tags_list[j])
        if d < 5 and not is_float_integer(d):
            l3.append((hierarchy_tags_list[i], hierarchy_tags_list[j], d))
        elif 0 < d < 2:
            l2.append((hierarchy_tags_list[i], hierarchy_tags_list[j], d))
        elif 2 <= d < 5:
            l.append((hierarchy_tags_list[i], hierarchy_tags_list[j], d))

# sort l3 based on the third element
l3.sort(key=lambda x: x[2])
for i in range(len(l3)):
    print(f'assert(distance("{l3[i][0]}", "{l3[i][1]}") == {l3[i][2]})')    

import random
random.shuffle(l2)
for i in range(5):
    print(f'assert(distance("{l2[i][0]}", "{l2[i][1]}") == {l2[i][2]})')            

import random
random.shuffle(l)
for i in range(50):
    print(f'assert(distance("{l[i][0]}", "{l[i][1]}") == {l[i][2]})')

client.close()
