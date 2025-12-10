import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        // Set base URL - works for root domain (Netlify/Vercel) and subpaths (GitHub Pages)
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const baseURL = pathParts.length > 0 && pathParts[0] === 'CSC4821' 
            ? '/CSC4821/' 
            : '/';
        
        this.load.setBaseURL(baseURL);
        this.load.image('background', 'assets/Firewallbkg.jpeg');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
