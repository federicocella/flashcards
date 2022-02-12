import { useUser } from '@/utils/useUser';
import { supabase } from '@/utils/supabase-client'
import { useState, useEffect } from 'react';
import { FileDrop } from 'react-file-drop'
import { useRouter } from 'next/router';
import Button from '@/components/ui/Button';
import { PoplarSelect } from '@/components/ui/poplar-ui';

export default function App() {
    const { userLoaded, user, session, userDetails } = useUser();
    const [projectname, setDeckname] = useState('')
    const [submitting, setSubmitting] = useState(false);
    const [filesToUpload, setFiles] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (userLoaded && !user) router.replace('/signin');
    }, [userLoaded, user]);

    async function createDeck(files) {
        setSubmitting(true)
        const name = projectname || files[0].name
        const newDeck = {
            name: name,
        }
        const { data, error } = await supabase.from('decks').insert(newDeck)

        if (!error) {
            router.push('/deck/' + data[0].id)
            setSubmitting(false);
        } else {
            console.log('Error', error)
            setSubmitting(false)
        }
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
        setDeckname(e.target.value)
    }

    if (!user) {
        return (<div>User not defined</div>)
    } else return (
        <div onDrop={e => { e.preventDefault(); }} className='max-w-screen-lg mx-auto px-12 my-20'>
            <div className='w-full'>
                <form onSubmit={handleSubmit}>
                    <label>
                        <input id='projectname' autoFocus={true} value={projectname} onChange={handleChange} placeholder='New project' type="text" name="nome"
                            className='font-bold text-3xl my-5 w-full focus:ring-0 focus:outline-none placeholder-gray-300 bg-transparent' />
                    </label>
                    <PoplarSelect options={[
                        { value: 'chocolate', label: 'Chocolate' },
                        { value: 'strawberry', label: 'Strawberry' },
                        { value: 'vanilla', label: 'Vanilla' }
                    ]}>
                    </PoplarSelect>
                    <Button variant="slim" onClick={(e) => createDeck(filesToUpload)}>{submitting ? (
                        <div>
                            Creating... {' '}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>

                        </div>
                    ) : (
                        <div>Create Deck</div>
                    )}</Button>
                </form>
            </div>
        </div >)
}