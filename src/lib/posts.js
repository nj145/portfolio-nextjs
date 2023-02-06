import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
    // get file names under posts directory
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((file) => {
        // remove .md from filename to get id
        const id = file.replace(/\.md$/, '');
        console.log(`id - ${id}`);

        // read markdown file as string
        const fullPath = path.join(postsDirectory, file);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // use gray-matter to parse the meta data section from the file contents
        const matterResult = matter(fileContents);

        // combine the meta data with the id
        return {
            id,
            ...matterResult.data
        };
    });
    // sort the posts based on date
    return allPostsData.sort((a,b) => {
        if (a.date >= b.date) {
            return -1;
        } else {
            return 1;
        }
    })
}

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory);
    return fileNames.map((fileName) => {
        return {
            params: {
                id: fileName.replace(/\.md$/, '')
            }
        };
    });
}

export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const matterResult = matter(fileContents);

    const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        id,
        contentHtml,
        ...matterResult.data
    };
}