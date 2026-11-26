"""Build the animation camera in Blender 4.2, including an optional proxy scene."""

import argparse
import json
import math
from pathlib import Path
import sys

import bpy
from mathutils import Quaternion, Vector


def trajectory_path():
    space = getattr(bpy.context, "space_data", None)
    editor_text = getattr(space, "text", None)
    current_file = Path(bpy.path.abspath(editor_text.filepath)) if editor_text and editor_text.filepath else None
    if current_file is None and "__file__" in globals():
        current_file = Path(__file__)
    return (current_file.resolve().parent if current_file else Path.cwd()) / "trajectory.json"


def material(name,color):
    mat = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    mat.diffuse_color = (*color,1.)
    return mat


def sphere(name,p,r,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,location=p)
    obj = bpy.context.object
    obj.name = name
    obj.scale = r
    obj.data.materials.append(mat)
    for surface in obj.data.polygons:
        surface.use_smooth = True
    return obj


def block(name,p,size,mat):
    bpy.ops.mesh.primitive_cube_add(size=1,location=p)
    obj = bpy.context.object
    obj.name = name
    obj.scale = size
    obj.data.materials.append(mat)
    return obj


def limb(name,a,b,radius,mat):
    a,b = Vector(a),Vector(b)
    obj = sphere(name,(a+b)*.5,(radius,radius,(a-b).length*.565),mat)
    obj.rotation_euler = (b-a).to_track_quat("Z","Y").to_euler()


def proxy_person(h, profile):
    scale = h/1.74
    cloth = material("Jacket",(.08,.37,.48))
    skin = material("Skin",(.65,.37,.23))
    boots = material("Shoes",(.13,.17,.19))
    seated = profile=="motorcycle"
    airborne = profile=="swing"
    def pos(x,y,z):
        return (x*scale,y*scale,z*scale)
    sphere("Pelvis",pos(0,0,0),pos(.16,.115,.113),cloth)
    sphere("Torso",pos(0,-.045 if seated else 0,.26),pos(.20,.13,.26),cloth)
    sphere("Neck",pos(0,0,.49),pos(.046,.045,.08),skin)
    sphere("Head",pos(0,0,.64),pos(.103,.09,.137),skin)
    sphere("Nose",pos(0,-.082,.64),pos(.027,.044,.034),skin)
    for side in (-1,1):
        a = pos(side*.17,0,.42)
        b = pos(side*.27,-.12,.24 if not airborne else .67)
        c = pos(side*.24,-.52 if seated else -.18,.20 if seated else (.88 if airborne else .04))
        limb("Upper arm",a,b,.065*scale,cloth)
        limb("Forearm",b,c,.049*scale,skin)
        hip = pos(side*.11,0,-.03)
        knee = pos(side*.16,-.29 if (seated or airborne) else -.056,-.22 if seated else -.42)
        ankle = pos(side*.14,.02 if seated else -.07,-.55 if (seated or airborne) else -.89)
        limb("Thigh",hip,knee,.087*scale,cloth)
        limb("Calf",knee,ankle,.063*scale,cloth)
        sphere("Foot",ankle,pos(.07,.135,.06),boots)
    if seated:
        frame = material("Fuel tank",(.49,.15,.10))
        block("Bike frame",pos(0,-.17,-.23),pos(.24,.91,.24),frame)
        for y in (-.79,.61):
            bpy.ops.mesh.primitive_torus_add(location=pos(0,y,-.57),major_radius=.28*scale,
                                             minor_radius=.070*scale,rotation=(0,math.pi/2,0))
            bpy.context.object.data.materials.append(boots)


def proxy_aircraft(length):
    frame = material("Aircraft",(.23,.39,.19))
    dark = material("Aircraft trim",(.08,.11,.13))
    sphere("Fuselage",(0,0,0),(.125*length,.24*length,.095*length),frame)
    block("Tail",(0,.29*length,.025*length),(.027*length,.48*length,.042*length),frame)
    block("Elevator",(0,.50*length,.025*length),(.21*length,.046*length,.024*length),dark)
    block("Main rotor",(0,0,.14*length),(.89*length,.028*length,.012*length),dark)
    block("Main rotor crossbar",(0,0,.14*length),(.028*length,.89*length,.012*length),dark)
    for x in (-.10*length,.10*length):
        block("Skid",(x,-.02*length,-.13*length),(.022*length,.37*length,.024*length),dark)


def stage(h,profile):
    if profile=="aircraft":
        proxy_aircraft(h)
        return
    proxy_person(h,profile)
    if profile=="swing":
        return
    ground = -.55*h if profile=="human" else -.52*h
    mesh = bpy.data.meshes.new("Stage grid")
    vertices,faces = [],[]
    for x in range(-13,13):
        for y in range(-13,13):
            i = len(vertices)
            vertices.extend((a,b,ground) for a,b in ((x,y),(x+1,y),(x+1,y+1),(x,y+1)))
            faces.append(tuple(range(i,i+4)))
    mesh.from_pydata(vertices,[],faces)
    obj = bpy.data.objects.new("Stage grid",mesh)
    bpy.context.collection.objects.link(obj)
    mesh.materials.append(material("Grid light",(.34,.37,.43)))
    mesh.materials.append(material("Grid dark",(.24,.27,.32)))
    for poly in mesh.polygons:
        poly.material_index = (poly.index + poly.index//26)%2


def build(payload,profile):
    if payload.get("coordinate_system")!="blender_z_up_camera_to_subject_root_quaternion_wxyz":
        raise ValueError("Unsupported trajectory convention")
    frames = payload["frames"]
    k = payload["intrinsics"]
    fps = float(payload["fps"])
    w,h = int(k["width"]),int(k["height"])
    if len(frames)<2 or min(w,h,k["fx"],k["fy"],fps)<=0:
        raise ValueError("Trajectory or camera intrinsics are incomplete")
    scene = bpy.context.scene
    data = bpy.data.cameras.new("Recovered camera")
    camera = bpy.data.objects.new("Recovered camera",data)
    bpy.context.collection.objects.link(camera)
    camera.rotation_mode = "QUATERNION"
    scene.camera = camera
    scene.render.resolution_x,scene.render.resolution_y = w,h
    scene.render.resolution_percentage = 100
    ratio = float(k["fx"]/k["fy"])
    scene.render.pixel_aspect_x = max(1.,1/ratio)
    scene.render.pixel_aspect_y = max(1.,ratio)
    scene.render.fps = max(1,round(fps))
    scene.render.fps_base = scene.render.fps/fps
    data.sensor_width,data.sensor_fit = 36,"HORIZONTAL"
    data.lens = 36*k["fx"]/w
    data.shift_x = (w/2-k["cx"])/w
    data.shift_y = (k["cy"]-h/2)*ratio/w
    data.clip_start = .025
    data.clip_end = 1000
    previous = -1
    for f in frames:
        at = int(f["frame"])
        q = Quaternion(f["quaternion"])
        xyz = f["position"]
        if at<=previous or not all(math.isfinite(x) for x in (*xyz,*q)) or abs(q.magnitude-1)>.001:
            raise ValueError(f"Invalid pose at frame {at}")
        camera.location = xyz
        camera.rotation_quaternion = q
        camera.keyframe_insert(data_path="location",frame=at)
        camera.keyframe_insert(data_path="rotation_quaternion",frame=at)
        previous = at
    for fcurve in camera.animation_data.action.fcurves:
        for keyframe in fcurve.keyframe_points:
            keyframe.interpolation = "LINEAR"
    scene.frame_start,scene.frame_end = int(frames[0]["frame"]),int(frames[-1]["frame"])
    scene.frame_set(scene.frame_start)
    if profile!="none":
        stage(float(payload["subject_height_m"]),profile)
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.render_aa = "FXAA"
    shading = scene.display.shading
    shading.light = "STUDIO"
    shading.color_type = "MATERIAL"
    shading.background_type = "WORLD"
    shading.show_shadows = True
    shading.show_cavity = True
    scene.world = bpy.data.worlds.new("Stage background")
    scene.world.color = (.17,.21,.29)
    scene.render.threads_mode = "FIXED"
    scene.render.threads = 2
    return scene


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--trajectory",type=Path,default=trajectory_path())
    p.add_argument("--blend",type=Path)
    p.add_argument("--proxy",choices=("none","human","motorcycle","aircraft","swing"),default="human")
    p.add_argument("--render-dir",type=Path)
    p.add_argument("--start",type=int)
    p.add_argument("--end",type=int)
    p.add_argument("--step",type=int,default=1)
    p.add_argument("--render-width",type=int,default=480)
    args = p.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
    payload = json.loads(args.trajectory.read_text())
    if bpy.app.background:
        bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = build(payload,args.proxy)
    if args.blend:
        args.blend.parent.mkdir(parents=True,exist_ok=True)
        bpy.ops.wm.save_as_mainfile(filepath=str(args.blend.resolve()))
    if args.render_dir:
        args.render_dir.mkdir(parents=True,exist_ok=True)
        scene.render.resolution_percentage = min(100,max(1,round(100*args.render_width/scene.render.resolution_x)))
        scene.render.image_settings.color_mode = "RGB"
        scene.render.filepath = str(args.render_dir.resolve()/"#####")
        scene.frame_start = args.start if args.start is not None else scene.frame_start
        scene.frame_end = args.end if args.end is not None else scene.frame_end
        scene.frame_step = args.step
        bpy.ops.render.render(animation=True)


if __name__=="__main__":
    main()
