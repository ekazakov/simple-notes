import './Header.css';
import React from 'react';
import classnames from 'classnames';

const pluralize = (word, number) => number === 1 ? word : `${word}s`;

export default function Header(props) {
    const {
        viewer: { totalCount },
        className,
    } = props;

    return (
        <div
            className={classnames(className, 'Header')}
        >
            <h1 className="Header__Title">
                My relay and GraphQL Notes
            </h1>
            <div className="Header__SubTitle">
                Total {totalCount} {pluralize('note', totalCount)}
            </div>
        </div>
    );
}