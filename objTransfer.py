#split mesh in .obj
f=open("test_model/Yuuripose.obj")

lines=f.readlines()
isFirstFile=True
tempFile=[]

for line in lines:

    lineList=line.split(" ")

    if lineList[0]=="o" and isFirstFile:
        tempFile=open("{0}.obj".format(lineList[1]),"w")
    elif lineList[0]=="o" and not isFirstFile:
        tempFile.close()
        tempFile=open("{0}.obj".format(lineList[1]),"w")
    elif lineList[0]=="v" or lineList[0]=="f":
        tempFile.write(line)


tempFile.close()
f.close()