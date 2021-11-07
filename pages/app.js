import { useUser } from '@/utils/useUser';
import { supabase } from '@/utils/supabase-client'
import Image from 'next/image'
import { useState, useEffect } from 'react';
import { FileDrop } from 'react-file-drop'
import Viewer from '@/components/Viewer';

export const Project = (props) => {

    const url = props.proj.pictures[0]
    const [profile, setProfile] = useState('')
    useEffect(() => {
        if (url) downloadImage(url)
    }, [])

    async function downloadImage(path) {
        try {
            const { data, error } = await supabase.storage.from('avatars').getPublicUrl(path)

            if (error) {
                throw error
            }
            //const url = URL.createObjectURL(data)
            setProfile(data.publicURL)
        }
        catch (error) {
            console.log('Error dowloading image: ', error.message)
        }
    }

    return (
        <div className='p-5 m-5' >
            <h3 className='text-3xl my-5'>{props.proj.name.split('.')[0]}</h3>
            {profile &&
                <Image src={profile}
                    alt='profile pic'
                    width={200}
                    height={200}
                    className='rounded-xl'
                />}
            <button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            </button>
            <button onClick={(e) => props.onClick(e, props.index)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div >
    )
}


export default function App() {
    const { userLoaded, user, session, userDetails } = useUser();
    const [projectname, setProjectname] = useState('')
    const [submitting, setSubmitting] = useState(false);
    const [projects, setProjects] = useState([])

    const garzaImages = ['/Garza/F31 garza-360-01.jpg', '/Garza/F31 garza-360-02.jpg', '/Garza/F31 garza-360-03.jpg',
        '/Garza/F31 garza-360-04.jpg', '/Garza/F31 garza-360-05.jpg', '/Garza/F31 garza-360-06.jpg',
        '/Garza/F31 garza-360-07.jpg', '/Garza/F31 garza-360-08.jpg', '/Garza/F31 garza-360-09.jpg',
        '/Garza/F31 garza-360-10.jpg', '/Garza/F31 garza-360-11.jpg', '/Garza/F31 garza-360-12.jpg',]

    useEffect(() => {
        allProjects()
    }, [session])

    async function allProjects() {
        if (!user) return []
        const { data, error, status } = await supabase.from('projects').select('id, user_id, name, pictures').eq('user_id', user.id)
        if (error) throw error

        setProjects(data)
    }

    async function createProject(files) {
        setSubmitting(true)
        const uploadedImagePaths = await uploadImages(files)
        const newProject = {
            user_id: user.id,
            name: files[0].name,
            pictures: uploadedImagePaths,
        }
        const { error } = await supabase.from('projects').insert(newProject)

        if (!error) {
            const updatedProjects = [...projects, newProject]
            setProjects(updatedProjects)
            setSubmitting(false);
        } else {
            console.log('Error', error)
            setSubmitting(false)
        }
    }

    async function deleteProject(e, i) {
        const toRemove = projects[i].pictures
        const { data, error } = await supabase.storage.from('avatars').remove(toRemove)
        console.log('pictures to remove ', data, toRemove)
        //console.log('error', error)
        if (!error) {
            const { data, error } = await supabase.from('projects').delete().match({ id: projects[i].id })
            //    console.log('deleted project ', data)
        }
        const updatedProjects = projects.filter((p, j) => { return j !== i })
        console.log('updated projects', updatedProjects)
        setProjects(updatedProjects)
    }

    const uploadImages = async (files) => {
        files = [...files]
        console.log('Files', files)
        if (files.length === 0) {
            return [];
        }
        const UploadedImageData = await Promise.all(
            files.map(async (file) => {
                const { data, error } = await supabase.storage
                    .from('avatars')
                    .upload(file.name, file, { returning: 'minimal', cacheControl: '3600', upsert: true });
                if (error) {
                    console.log("error in uploading image: ", error);
                    throw error;
                }
                if (data) {
                    console.log("image uploaded successfully: ", data);
                    console.log("Logging image_path: ", data.Key);
                    return data.Key.split('/')[1];
                }
            })
        );

        console.log("UploadedImageData: ", UploadedImageData);
        return UploadedImageData;
    }

    const handleSubmit = e => {
        e.preventDefault()

    }

    const handleChange = e => {
        setProjectname(e.target.value)
    }

    // account name = userDetails.full_name.split(' ')[0]
    // list of products
    // image of products


    if (!user) {
        return (<div>User not defined</div>)
    } else return (
        <div className='p-10 '>
            <h1 className='text-5xl text-center'>Hello Lorenzo,</h1>
            <h2 className='text-3xl text-center'>Your Projects</h2>
            <div className='flex'>
                {projects.map((p, i) => <Project proj={p} key={i} index={i} onClick={deleteProject} />)}
                <div className='p-3 m-4'>
                    <form onSubmit={handleSubmit}>
                        <label>
                            <input id='projectname' value={projectname} onChange={handleChange} placeholder='New project' type="text" name="nome" className='text-3xl my-5 bg-black' />
                        </label>
                        <FileDrop onDrop={(files, e) => createProject(files)}>
                            <div id='droppable'
                                className='p-20 border-4 border-white border-opacity-50 border-dashed rounded-xl hover:bg-gray-800'>
                                <button>Select files or drop here
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </FileDrop>
                        <button>{submitting ? (
                            <div className='p-3 m-5'>
                                Creating... {' '}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>

                            </div>
                        ) : (
                            <div className='p-3 m-5'>Create Project</div>
                        )}</button>
                    </form>
                </div>
            </div>
            <div>
                <h2>
                    360 Preview
                </h2>
                <Viewer images={garzaImages}></Viewer>
            </div>
        </div >)
}