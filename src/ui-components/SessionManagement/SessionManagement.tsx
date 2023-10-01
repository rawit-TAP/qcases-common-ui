import React from 'react';
import { Options, sessionCheckIframeId } from './SessionManagement.types';

export const SessionManagement: React.FC<React.PropsWithChildren<{
    options: Options,
    sessionChanged: (e) => void
}>> = ({
    children,
    options,
    sessionChanged
}) => {
    const checkSessionIntervalInMs = !options.checkSessionInterval ? 5 * 1000
        : options.checkSessionInterval;
    React.useEffect(() => {
        const checkSession = () => {
            console.log('Checking session', sessionCheckIframeId);
            const win = (document.getElementById(sessionCheckIframeId) as HTMLIFrameElement).contentWindow;

            console.log('Checking session id', options.getSessionIdFn());
            win!.postMessage(options.getSessionIdFn(), options.idpOrigin);
        }
        checkSession();
        const timerId = setInterval(checkSession, checkSessionIntervalInMs);
        const receiveMessage = (e) => {
            console.log('Target origin', options.idpOrigin);
            console.log('Event origin', e.origin);
            if (e.origin !== options.idpOrigin) {
                return;
            }
            if (e.data === 'changed') {
                clearInterval(timerId);
                // then take the actions below...
                // Emit session changed event, require refetch token
                sessionChanged(e);
            }
        }
        window.addEventListener('message', receiveMessage);
        return () => {
            window.removeEventListener('message', receiveMessage);
            clearInterval(timerId);
        }
    }, [sessionChanged]);
    return (
        <React.Fragment>
            <iframe src={options.idpOrigin + options.checkSessionIframePath} id={sessionCheckIframeId}></iframe>
            {children}
        </React.Fragment>
    );
}
