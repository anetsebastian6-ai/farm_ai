import React from 'react';
import "@fontsource/open-sans";

import logo from '../Images/farm-ai-logo.svg';
function HeaderSection() {
    return (
        <div className='slide-right' style={{ marginLeft: '100px', height: '70px', alignItems: 'center' }}>
            {/* <span> */}
            {/* <span style={{ display: 'flex' }}> */}
            <img style={{ marginTop: '10px', marginBottom: '10px', marginLeft: '30px', height: '50px', width: '140px' }} src={logo} alt="FARM AI logo" />
        </div>
    )
}
export default HeaderSection;